import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { contarPresencas, minhaPresenca, definirPresenca } from '../lib/presenca'
import { eventoJaPassou } from '../lib/formatacao'

export default function BotaoPresenca({ evento }) {
  const { usuario, autenticado } = useAuth()
  const local = useLocation()
  const [vai, setVai] = useState(false)
  const [total, setTotal] = useState(0)
  const [ocupado, setOcupado] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    Promise.all([contarPresencas(evento.id), minhaPresenca(evento.id, usuario)])
      .then(([t, m]) => {
        if (!ativo) return
        setTotal(t)
        setVai(m)
      })
      .catch(() => {})
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [evento.id, usuario])

  if (eventoJaPassou(evento)) return null

  async function alternar() {
    const novo = !vai
    setOcupado(true)
    // otimista
    setVai(novo)
    setTotal((t) => Math.max(0, t + (novo ? 1 : -1)))
    try {
      await definirPresenca(evento.id, usuario, novo)
    } catch {
      setVai(!novo)
      setTotal((t) => Math.max(0, t + (novo ? -1 : 1)))
    } finally {
      setOcupado(false)
    }
  }

  const contagem =
    total > 0 ? ` · ${total} ${total === 1 ? 'confirmado' : 'confirmados'}` : ''

  if (!autenticado) {
    return (
      <Link
        to="/entrar"
        state={{ de: local.pathname }}
        className="btn-contorno !px-3 !py-2 text-sm"
      >
        <span aria-hidden="true">✋</span> Vou participar{contagem}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={ocupado || carregando}
      aria-pressed={vai}
      className={vai ? 'btn-destaque !px-3 !py-2 text-sm' : 'btn-contorno !px-3 !py-2 text-sm'}
    >
      <span aria-hidden="true">{vai ? '✓' : '✋'}</span>{' '}
      {vai ? 'Você vai participar' : 'Vou participar'}
      {contagem}
    </button>
  )
}
