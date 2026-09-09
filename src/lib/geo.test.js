import { describe, it, expect } from 'vitest'
import {
  haversineKm,
  distanciaAteSlug,
  formatarDistancia,
  cidadeMaisProxima,
  dentroDaCobertura,
  dentroDoRaio,
  RAIO_COBERTURA_KM,
} from './geo'

describe('haversineKm', () => {
  it('mesma coordenada → 0', () => {
    expect(haversineKm({ lat: -26, lng: -49 }, { lat: -26, lng: -49 })).toBe(0)
  })
  it('Jaraguá do Sul → Blumenau ≈ 45 km', () => {
    const d = haversineKm({ lat: -26.4851, lng: -49.0666 }, { lat: -26.9194, lng: -49.0661 })
    expect(d).toBeGreaterThan(40)
    expect(d).toBeLessThan(55)
  })
})

describe('distanciaAteSlug', () => {
  it('usa o mapa de referência das cidades', () => {
    const d = distanciaAteSlug({ lat: -26.49, lng: -49.07 }, 'jaragua-do-sul')
    expect(d).toBeLessThan(3)
  })
  it('null sem origem ou slug desconhecido', () => {
    expect(distanciaAteSlug(null, 'blumenau')).toBeNull()
    expect(distanciaAteSlug({ lat: 0, lng: 0 }, 'inexistente')).toBeNull()
  })
})

describe('formatarDistancia', () => {
  it('metros abaixo de 1 km, uma casa até 10, inteiro acima', () => {
    expect(formatarDistancia(0.4)).toBe('400 m')
    expect(formatarDistancia(2.34)).toBe('2,3 km')
    expect(formatarDistancia(42.7)).toBe('43 km')
  })
})

describe('cidadeMaisProxima', () => {
  it('encontra pela distância mesmo sem lat/lng no registro', () => {
    const cidades = [{ slug: 'blumenau' }, { slug: 'jaragua-do-sul' }, { slug: 'salvador' }]
    const r = cidadeMaisProxima({ lat: -26.49, lng: -49.07 }, cidades)
    expect(r.cidade.slug).toBe('jaragua-do-sul')
  })

  it('quem está fora da área ainda recebe a cidade mais próxima + a distância real', () => {
    // ponto no meio do Amazonas, longe de tudo
    const cidades = [{ slug: 'blumenau' }, { slug: 'jaragua-do-sul' }, { slug: 'parintins' }]
    const r = cidadeMaisProxima({ lat: -4.5, lng: -60 }, cidades)
    expect(r.cidade.slug).toBe('parintins')
    expect(r.distanciaKm).toBeGreaterThan(RAIO_COBERTURA_KM)
    expect(dentroDaCobertura(r.distanciaKm)).toBe(false)
  })
})

describe('dentroDaCobertura', () => {
  it('true dentro do raio, false fora, false para null', () => {
    expect(dentroDaCobertura(0)).toBe(true)
    expect(dentroDaCobertura(RAIO_COBERTURA_KM)).toBe(true)
    expect(dentroDaCobertura(RAIO_COBERTURA_KM + 1)).toBe(false)
    expect(dentroDaCobertura(null)).toBe(false)
  })
})

describe('dentroDoRaio', () => {
  it('raio nulo = sem limite (sempre true, mesmo sem distância)', () => {
    expect(dentroDoRaio(9999, null)).toBe(true)
    expect(dentroDoRaio(null, null)).toBe(true)
  })
  it('com raio, compara a distância', () => {
    expect(dentroDoRaio(20, 30)).toBe(true)
    expect(dentroDoRaio(30, 30)).toBe(true)
    expect(dentroDoRaio(31, 30)).toBe(false)
  })
  it('distância desconhecida não passa quando há raio', () => {
    expect(dentroDoRaio(null, 30)).toBe(false)
  })
})
