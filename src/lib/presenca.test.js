import { describe, it, expect, beforeEach } from 'vitest'
import {
  contarPresencas,
  minhaPresenca,
  definirPresenca,
  contarPresencasEm,
} from './presenca'

// localStorage falso (modo demonstração roda sem Supabase nos testes)
beforeEach(() => {
  const mapa = new Map()
  globalThis.localStorage = {
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  }
})

const usuario = { id: 'u1', email: 'u@demo' }

describe('presença (modo demonstração)', () => {
  it('sem confirmar, contagem é 0 e minhaPresenca é falsa', async () => {
    expect(await contarPresencas('ev1')).toBe(0)
    expect(await minhaPresenca('ev1', usuario)).toBe(false)
  })

  it('confirmar e desmarcar altera contagem e estado', async () => {
    await definirPresenca('ev1', usuario, true)
    expect(await contarPresencas('ev1')).toBe(1)
    expect(await minhaPresenca('ev1', usuario)).toBe(true)

    await definirPresenca('ev1', usuario, false)
    expect(await contarPresencas('ev1')).toBe(0)
    expect(await minhaPresenca('ev1', usuario)).toBe(false)
  })

  it('sem usuário, definirPresenca lança erro', async () => {
    await expect(definirPresenca('ev1', null, true)).rejects.toThrow()
  })

  it('contarPresencasEm devolve um mapa por id', async () => {
    await definirPresenca('a', usuario, true)
    expect(await contarPresencasEm(['a', 'b'])).toEqual({ a: 1, b: 0 })
    expect(await contarPresencasEm([])).toEqual({})
  })
})
