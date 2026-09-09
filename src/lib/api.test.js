import { describe, it, expect } from 'vitest'
import { normalizar, aplicarFiltros, gerarSlug, montarRegistroEvento, ehDestaque } from './api'

const base = [
  { id: 'a', titulo: 'Festival de Cinema', descricao: '', cidade_nome: 'Gramado', local: 'Palácio',
    cidade: 'gramado', categoria: 'cultura', entrada: 'pago', status: 'aprovado',
    data_inicio: '2099-08-10', data_fim: '2099-08-15' },
  { id: 'b', titulo: 'Feira do Livro', descricao: '', cidade_nome: 'Porto Alegre', local: 'Praça',
    cidade: 'porto-alegre', categoria: 'educacao', entrada: 'gratuito', status: 'aprovado',
    data_inicio: '2099-10-30', data_fim: '2099-11-15' },
  { id: 'c', titulo: 'Evento antigo', descricao: '', cidade_nome: 'Curitiba', local: 'Teatro',
    cidade: 'curitiba', categoria: 'cultura', entrada: 'gratuito', status: 'aprovado',
    data_inicio: '2000-01-01', data_fim: '2000-01-02' },
  { id: 'd', titulo: 'Pendente', descricao: '', cidade_nome: 'Gramado', local: 'x',
    cidade: 'gramado', categoria: 'cultura', entrada: 'pago', status: 'pendente',
    data_inicio: '2099-09-01' },
]

describe('normalizar', () => {
  it('remove acentos e caixa', () => {
    expect(normalizar('São PAULO — Ópera')).toBe('sao paulo — opera')
  })
})

describe('aplicarFiltros', () => {
  it('só retorna eventos aprovados', () => {
    const r = aplicarFiltros(base, { quando: '' })
    expect(r.map((e) => e.id).sort()).toEqual(['a', 'b', 'c'])
  })
  it('filtra por cidade', () => {
    expect(aplicarFiltros(base, { cidade: 'gramado', quando: '' }).map((e) => e.id)).toEqual(['a'])
  })
  it('filtra por categoria e entrada juntas', () => {
    const r = aplicarFiltros(base, { categoria: 'educacao', entrada: 'gratuito', quando: '' })
    expect(r.map((e) => e.id)).toEqual(['b'])
  })
  it('busca por texto ignora acentos', () => {
    expect(aplicarFiltros(base, { busca: 'livro', quando: '' }).map((e) => e.id)).toEqual(['b'])
  })
  it('quando=futuros esconde eventos encerrados', () => {
    expect(aplicarFiltros(base, { quando: 'futuros' }).map((e) => e.id).sort()).toEqual(['a', 'b'])
  })
  it('ordena por data de início', () => {
    const r = aplicarFiltros(base, { quando: 'futuros' })
    expect(r[0].id).toBe('a')
  })
  it('filtra por formato (presencial é o padrão quando ausente)', () => {
    const comFormato = [
      { ...base[0], formato: 'online' },
      { ...base[1] }, // sem formato → presencial
    ]
    expect(aplicarFiltros(comFormato, { formato: 'online', quando: '' }).map((e) => e.id)).toEqual(['a'])
    expect(aplicarFiltros(comFormato, { formato: 'presencial', quando: '' }).map((e) => e.id)).toEqual(['b'])
  })
  it('intervalo de datas: de/ate tem prioridade sobre quando', () => {
    const r = aplicarFiltros(base, { de: '2099-08-01', ate: '2099-08-31', quando: 'futuros' })
    expect(r.map((e) => e.id)).toEqual(['a'])
  })
  it('ordena por nome e por recentes', () => {
    const comData = base.map((e, i) => ({ ...e, criado_em: `2026-01-0${i + 1}` }))
    expect(aplicarFiltros(comData, { quando: '', ordenar: 'nome' })[0].titulo).toBe('Evento antigo')
    expect(aplicarFiltros(comData, { quando: '', ordenar: 'recentes' })[0].id).toBe('c')
  })
})

describe('montarRegistroEvento', () => {
  it('remove campos que não são colunas (ex.: aceite)', () => {
    const r = montarRegistroEvento({ titulo: 'X', aceite: true, foo: 1 })
    expect('aceite' in r).toBe(false)
    expect('foo' in r).toBe(false)
    expect(r.titulo).toBe('X')
  })
  it('troca string vazia por null (data_fim em branco não quebra o insert)', () => {
    const r = montarRegistroEvento({ titulo: 'X', data_fim: '', endereco: '' })
    expect(r.data_fim).toBeNull()
    expect(r.endereco).toBeNull()
  })
  it('recorta data para YYYY-MM-DD', () => {
    const r = montarRegistroEvento({ data_inicio: '2026-10-08T00:00:00.000Z' })
    expect(r.data_inicio).toBe('2026-10-08')
  })
})

describe('ehDestaque', () => {
  it('usa o valor do evento quando não há override', () => {
    expect(ehDestaque({ id: 'a', destaque: true }, {})).toBe(true)
    expect(ehDestaque({ id: 'b', destaque: false }, {})).toBe(false)
  })
  it('override local tem prioridade (modo demonstração)', () => {
    expect(ehDestaque({ id: 'a', destaque: true }, { a: false })).toBe(false)
    expect(ehDestaque({ id: 'b', destaque: false }, { b: true })).toBe(true)
  })
})

describe('gerarSlug', () => {
  it('gera slug legível com sufixo', () => {
    expect(gerarSlug('Feira Cultural do Bairro!')).toMatch(/^feira-cultural-do-bairro-[a-z0-9]{5}$/)
  })
  it('lida com título vazio', () => {
    expect(gerarSlug('')).toMatch(/^evento-[a-z0-9]{5}$/)
  })
})
