import { useCallback, useEffect, useState } from 'react'

/**
 * Executa uma função assíncrona e devolve { dados, carregando, erro, recarregar }.
 * Reexecuta sempre que uma das dependências muda — ou quando `recarregar()` é chamado.
 */
export function useAsync(fn, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null })
  const [tick, setTick] = useState(0)
  const recarregar = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let ativo = true
    setEstado((e) => ({ ...e, carregando: true, erro: null }))
    Promise.resolve(fn())
      .then((dados) => ativo && setEstado({ dados, carregando: false, erro: null }))
      .catch((erro) => {
        console.error(erro)
        if (ativo) setEstado({ dados: null, carregando: false, erro })
      })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...estado, recarregar }
}
