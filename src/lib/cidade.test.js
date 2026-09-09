import { describe, it, expect } from 'vitest'
import { cidadeMaisProxima } from './cidade'

describe('cidadeMaisProxima', () => {
  const cidades = [
    { slug: 'jaragua-do-sul', nome: 'Jaraguá do Sul' }, // sem lat/lng → usa o fallback
    { slug: 'salvador', nome: 'Salvador', lat: -12.9777, lng: -38.5016 },
    { slug: 'sem-coord', nome: 'Sem Coord' }, // sem fallback também
  ]

  it('acha a cidade mais próxima mesmo sem lat/lng no registro (usa COORDENADAS)', () => {
    const r = cidadeMaisProxima({ lat: -26.49, lng: -49.07 }, cidades) // perto de Jaraguá
    expect(r?.cidade.slug).toBe('jaragua-do-sul')
    expect(r.distanciaKm).toBeLessThan(5)
  })

  it('usa lat/lng do registro quando existem', () => {
    const r = cidadeMaisProxima({ lat: -13.0, lng: -38.5 }, cidades) // perto de Salvador
    expect(r?.cidade.slug).toBe('salvador')
  })

  it('retorna null quando nenhuma cidade tem coordenada', () => {
    expect(cidadeMaisProxima({ lat: 0, lng: 0 }, [{ slug: 'sem-coord' }])).toBeNull()
  })
})
