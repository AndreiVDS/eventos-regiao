import { describe, it, expect } from 'vitest'
import {
  proximoFimDeSemana,
  eventoNoIntervalo,
  eventosDoFimDeSemana,
  eventosRelacionados,
} from './agenda'

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

describe('proximoFimDeSemana', () => {
  it('a partir de uma quarta, aponta para o sábado/domingo seguintes', () => {
    const { inicio, fim } = proximoFimDeSemana(new Date(2026, 9, 7)) // quarta 07/out
    expect(inicio.getDay()).toBe(6)
    expect(fim.getDay()).toBe(0)
    expect(iso(inicio)).toBe('2026-10-10')
  })
  it('se já é sábado, usa o fim de semana atual', () => {
    expect(iso(proximoFimDeSemana(new Date(2026, 9, 10)).inicio)).toBe('2026-10-10')
  })
  it('se é domingo, volta para o sábado anterior', () => {
    expect(iso(proximoFimDeSemana(new Date(2026, 9, 11)).inicio)).toBe('2026-10-10')
  })
})

describe('eventoNoIntervalo / eventosDoFimDeSemana', () => {
  const base = new Date(2026, 9, 7) // quarta → fim de semana: 10 e 11
  const eventos = [
    { id: 'a', status: 'aprovado', data_inicio: '2026-10-10' }, // no sábado
    { id: 'b', status: 'aprovado', data_inicio: '2026-10-07', data_fim: '2026-10-25' }, // engloba
    { id: 'c', status: 'aprovado', data_inicio: '2026-10-13' }, // depois
    { id: 'd', status: 'pendente', data_inicio: '2026-10-11' }, // não aprovado
  ]
  it('inclui eventos que cruzam o fim de semana', () => {
    expect(eventosDoFimDeSemana(eventos, base).map((e) => e.id)).toEqual(['b', 'a'])
  })
  it('eventoNoIntervalo respeita as bordas', () => {
    const { inicio, fim } = proximoFimDeSemana(base)
    expect(eventoNoIntervalo({ data_inicio: '2026-10-12' }, inicio, fim)).toBe(false)
  })
})

describe('eventosRelacionados', () => {
  const evento = { id: 'x', cidade: 'blumenau', categoria: 'cultura', data_inicio: '2099-01-01' }
  const todos = [
    { id: 'x', cidade: 'blumenau', categoria: 'cultura', status: 'aprovado', data_inicio: '2099-01-01' },
    { id: 'mesma-cidade', cidade: 'blumenau', categoria: 'esporte', status: 'aprovado', data_inicio: '2099-02-01' },
    { id: 'mesma-cat', cidade: 'curitiba', categoria: 'cultura', status: 'aprovado', data_inicio: '2099-02-01' },
    { id: 'nada-a-ver', cidade: 'curitiba', categoria: 'esporte', status: 'aprovado', data_inicio: '2099-02-01' },
    { id: 'passado', cidade: 'blumenau', categoria: 'cultura', status: 'aprovado', data_inicio: '2000-01-01' },
  ]
  it('exclui o próprio, prioriza cidade e ignora quem não tem relação', () => {
    const r = eventosRelacionados(evento, todos, 5).map((e) => e.id)
    expect(r).toEqual(['mesma-cidade', 'mesma-cat'])
  })
})
