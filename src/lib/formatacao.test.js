import { describe, it, expect } from 'vitest'
import {
  formatarPeriodo,
  carimboData,
  eventoJaPassou,
  rotuloCategoria,
  rotuloEntrada,
} from './formatacao'

describe('formatarPeriodo', () => {
  it('mostra uma data única', () => {
    expect(formatarPeriodo('2026-10-08')).toBe('08 de outubro de 2026')
  })
  it('junta um intervalo no mesmo mês', () => {
    expect(formatarPeriodo('2026-10-08', '2026-10-18')).toBe('08 a 18 de outubro de 2026')
  })
  it('mostra os dois meses quando o intervalo cruza o mês', () => {
    expect(formatarPeriodo('2026-10-22', '2027-01-17')).toMatch(/^22 de out\.? a 17 de janeiro de 2027$/)
  })
  it('trata data final igual à inicial como data única', () => {
    expect(formatarPeriodo('2026-11-13', '2026-11-13')).toBe('13 de novembro de 2026')
  })
})

describe('carimboData', () => {
  it('devolve dia e mês abreviado em caixa alta', () => {
    expect(carimboData('2026-09-30')).toEqual({ dia: '30', mes: 'SET' })
  })
})

describe('eventoJaPassou', () => {
  it('é falso para eventos no futuro distante', () => {
    expect(eventoJaPassou({ data_inicio: '2099-01-01' })).toBe(false)
  })
  it('é verdadeiro para eventos no passado', () => {
    expect(eventoJaPassou({ data_inicio: '2000-01-01', data_fim: '2000-01-02' })).toBe(true)
  })
})

describe('rótulos', () => {
  it('traduz categoria e entrada', () => {
    expect(rotuloCategoria('cultura')).toBe('Cultura')
    expect(rotuloEntrada('gratuito')).toBe('Gratuito')
  })
  it('devolve o valor cru para chave desconhecida', () => {
    expect(rotuloCategoria('xpto')).toBe('xpto')
  })
})
