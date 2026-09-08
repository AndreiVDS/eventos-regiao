import { describe, it, expect } from 'vitest'
import { calcularMetricas } from './metricas'

const eventos = [
  { status: 'aprovado', cidade: 'gramado', cidade_nome: 'Gramado', uf: 'RS', categoria: 'cultura',
    entrada: 'gratuito', data_inicio: '2099-01-01', data_fim: '2099-01-05' },
  { status: 'aprovado', cidade: 'gramado', cidade_nome: 'Gramado', uf: 'RS', categoria: 'cultura',
    entrada: 'pago', data_inicio: '2099-02-01' },
  { status: 'aprovado', cidade: 'curitiba', cidade_nome: 'Curitiba', uf: 'PR', categoria: 'esporte',
    entrada: 'gratuito', data_inicio: '2099-03-01' },
  { status: 'pendente', cidade: 'curitiba', cidade_nome: 'Curitiba', uf: 'PR', categoria: 'cultura',
    entrada: 'pago', data_inicio: '2099-03-01' },
  { status: 'recusado', cidade: 'curitiba', cidade_nome: 'Curitiba', uf: 'PR', categoria: 'cultura',
    entrada: 'pago', data_inicio: '2099-03-01' },
]

describe('calcularMetricas', () => {
  const m = calcularMetricas(eventos)

  it('conta aprovados, pendentes e recusados', () => {
    expect(m.total).toBe(3)
    expect(m.pendentes).toBe(1)
    expect(m.recusados).toBe(1)
  })
  it('conta cidades e estados ativos (só de aprovados)', () => {
    expect(m.cidadesAtivas).toBe(2)
    expect(m.estadosAtivos).toBe(2)
  })
  it('calcula a % de gratuitos sobre os aprovados', () => {
    expect(m.pctGratuitos).toBe(67)
  })
  it('agrupa por cidade em ordem decrescente', () => {
    expect(m.porCidade[0]).toMatchObject({ rotulo: 'Gramado', valor: 2 })
  })
  it('inclui todas as categorias no gráfico, mesmo com zero', () => {
    expect(m.porCategoria).toHaveLength(6)
    expect(m.porCategoria.every((c) => typeof c.valor === 'number')).toBe(true)
  })
  it('projeta 12 meses na agenda', () => {
    expect(m.porMes).toHaveLength(12)
  })
})
