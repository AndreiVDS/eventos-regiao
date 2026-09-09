import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Carregando from '../../componentes/Carregando'
import { AbasPainel } from './Painel'
import { listarTodosEventos, alternarDestaque, ehDestaque } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { formatarPeriodo, rotuloCategoria, eventoJaPassou } from '../../lib/formatacao'

export default function Destaques() {
  const { sair } = useAuth()
  const [eventos, setEventos] = useState(null)
  const [busca, setBusca] = useState('')
  const [salvando, setSalvando] = useState(null)

  useEffect(() => {
    listarTodosEventos().then(setEventos).catch(() => setEventos([]))
  }, [])

  const lista = useMemo(() => {
    if (!eventos) return []
    const b = busca.trim().toLowerCase()
    return eventos
      .filter((e) => e.status === 'aprovado' && !eventoJaPassou(e))
      .filter((e) => !b || `${e.titulo} ${e.cidade_nome}`.toLowerCase().includes(b))
      .sort((a, b2) => new Date(a.data_inicio) - new Date(b2.data_inicio))
  }, [eventos, busca])

  async function alternar(e) {
    const novo = !ehDestaque(e)
    setSalvando(e.id)
    try {
      await alternarDestaque(e.id, novo)
      setEventos((atual) => atual.map((x) => (x.id === e.id ? { ...x, destaque: novo } : x)))
    } finally {
      setSalvando(null)
    }
  }

  if (!eventos) return <Carregando texto="Carregando eventos…" />

  const total = lista.filter((e) => ehDestaque(e)).length

  return (
    <div className="container-pagina py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-suave/80">Painel da equipe</p>
          <h1 className="text-4xl">Eventos em destaque</h1>
        </div>
        <button className="btn-contorno !py-2 text-sm" onClick={sair}>Sair</button>
      </div>

      <div className="mt-4">
        <AbasPainel />
      </div>

      <p className="mt-6 text-suave">
        Marque com a estrela os eventos que aparecem no carrossel da página inicial.{' '}
        <strong>{total}</strong> em destaque agora.
      </p>

      <input
        type="search"
        className="campo mt-4 max-w-sm"
        placeholder="Filtrar por título ou cidade…"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <ul className="mt-4 divide-y divide-borda/10 overflow-hidden rounded-xl bg-superficie ring-1 ring-borda/10">
        {lista.map((e) => {
          const ativo = ehDestaque(e)
          return (
            <li key={e.id} className="flex items-center gap-3 p-3">
              <button
                type="button"
                onClick={() => alternar(e)}
                disabled={salvando === e.id}
                aria-pressed={ativo}
                aria-label={ativo ? `Remover ${e.titulo} dos destaques` : `Destacar ${e.titulo}`}
                className={`shrink-0 rounded-lg p-2 text-2xl leading-none transition-transform hover:scale-110 ${
                  ativo ? 'text-destaque' : 'text-suave/40'
                }`}
              >
                {ativo ? '★' : '☆'}
              </button>
              <img src={e.imagem_url} alt="" className="h-12 w-16 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <Link to={`/eventos/${e.id}`} className="truncate font-semibold hover:underline">
                  {e.titulo}
                </Link>
                <p className="text-sm text-suave">
                  {rotuloCategoria(e.categoria)} · {e.cidade_nome}/{e.uf} ·{' '}
                  {formatarPeriodo(e.data_inicio, e.data_fim)}
                </p>
              </div>
            </li>
          )
        })}
        {lista.length === 0 && (
          <li className="p-6 text-center text-suave">Nenhum evento aprovado em cartaz.</li>
        )}
      </ul>
    </div>
  )
}
