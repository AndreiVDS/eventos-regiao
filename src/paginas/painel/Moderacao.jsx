import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Carregando from '../../componentes/Carregando'
import EstadoVazio from '../../componentes/EstadoVazio'
import { listarEventosPendentes, moderarEvento } from '../../lib/api'
import { supabase, supabaseConfigurado } from '../../lib/supabase'
import { formatarPeriodo, rotuloCategoria, rotuloEntrada } from '../../lib/formatacao'

export default function Moderacao() {
  const navigate = useNavigate()
  const [pendentes, setPendentes] = useState(null)
  const [processando, setProcessando] = useState(null)

  const carregar = useCallback(() => {
    listarEventosPendentes().then(setPendentes).catch(() => setPendentes([]))
  }, [])

  useEffect(() => {
    if (supabaseConfigurado) {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) navigate('/painel', { replace: true })
        else carregar()
      })
    } else {
      carregar()
    }
  }, [navigate, carregar])

  async function decidir(id, status) {
    setProcessando(id)
    try {
      await moderarEvento(id, status)
      setPendentes((lista) => lista.filter((e) => e.id !== id))
    } finally {
      setProcessando(null)
    }
  }

  async function sair() {
    if (supabaseConfigurado) await supabase.auth.signOut()
    navigate('/painel')
  }

  if (pendentes === null) return <Carregando texto="Carregando eventos pendentes…" />

  return (
    <div className="container-pagina py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl">Moderação de eventos</h1>
        <button className="btn-contorno !py-2 text-sm" onClick={sair}>
          Sair
        </button>
      </div>
      <p className="mt-1 text-tinta/70">
        {pendentes.length} evento{pendentes.length === 1 ? '' : 's'} aguardando revisão.
      </p>

      {pendentes.length === 0 ? (
        <div className="mt-8">
          <EstadoVazio titulo="Nada na fila" descricao="Todos os eventos enviados já foram revisados." />
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {pendentes.map((e) => (
            <li
              key={e.id}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-tinta/10 sm:flex sm:gap-5"
            >
              <img
                src={e.imagem_url}
                alt=""
                className="mb-3 h-32 w-full rounded-lg object-cover sm:mb-0 sm:w-48"
              />
              <div className="flex-1">
                <h2 className="text-xl">{e.titulo}</h2>
                <p className="text-sm text-tinta/60">
                  {rotuloCategoria(e.categoria)} · {e.cidade_nome}/{e.uf} ·{' '}
                  {formatarPeriodo(e.data_inicio, e.data_fim)} · {rotuloEntrada(e.entrada)}
                </p>
                <p className="mt-2 text-sm text-tinta/80">{e.descricao}</p>
                <p className="mt-2 text-xs text-tinta/60">
                  Organização: {e.organizador_nome} — contato: {e.organizador_contato || '—'}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    className="btn-destaque !py-2 text-sm"
                    disabled={processando === e.id}
                    onClick={() => decidir(e.id, 'aprovado')}
                  >
                    Aprovar
                  </button>
                  <button
                    className="btn-contorno !py-2 text-sm"
                    disabled={processando === e.id}
                    onClick={() => decidir(e.id, 'recusado')}
                  >
                    Recusar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
