import { useEffect, useState } from 'react'

/**
 * Executa uma função assíncrona e devolve { dados, carregando, erro }.
 * Reexecuta sempre que uma das dependências muda.
 */
export function useAsync(fn, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null })

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
  }, deps)

  return estado
}
