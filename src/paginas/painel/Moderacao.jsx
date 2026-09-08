import { useCallback, useEffect, useState } from 'react'
import Carregando from '../../componentes/Carregando'
import EstadoVazio from '../../componentes/EstadoVazio'
import { AbasPainel } from './Painel'
import { listarEventosPendentes, moderarEvento } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { formatarPeriodo, rotuloCategoria, rotuloEntrada } from '../../lib/formatacao'

export default function Moderacao() {
  const { sair } = useAuth()
  const [pendentes, setPendentes] = useState(null)
  const [processando, setProcessando] = useState(null)

  const carregar = useCallback(() => {
    listarEventosPendentes().then(setPendentes).catch(() => setPendentes([]))
  }, [])

  useEffect(() => carregar(), [carregar])

  async function decidir(id, status) {
    setProcessando(id)
    try {
      await moderarEvento(id, status)
      setPendentes((lista) => lista.filter((e) => e.id !== id))
    } finally {
      setProcessando(null)
    }
  }

  return (
    <div className="container-pagina py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-suave/80">Painel da equipe</p>
          <h1 className="text-4xl">Moderação de eventos</h1>
        </div>
        <button className="btn-contorno !py-2 text-sm" onClick={sair}>Sair</button>
      </div>

      <div className="mt-4">
        <AbasPainel />
      </div>

      {pendentes === null ? (
        <Carregando texto="Carregando eventos pendentes…" />
      ) : (
        <>
          <p className="mt-6 text-suave">
            {pendentes.length} evento{pendentes.length === 1 ? '' : 's'} aguardando revisão.
          </p>

          {pendentes.length === 0 ? (
            <div className="mt-6">
              <EstadoVazio
                titulo="Nada na fila"
                descricao="Todos os eventos enviados já foram revisados."
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {pendentes.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl bg-superficie p-5 shadow-sm ring-1 ring-borda/10 sm:flex sm:gap-5"
                >
                  <img
                    src={e.imagem_url}
                    alt=""
                    className="mb-3 h-32 w-full rounded-lg object-cover sm:mb-0 sm:w-48"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl">{e.titulo}</h2>
                    <p className="text-sm text-suave">
                      {rotuloCategoria(e.categoria)} · {e.cidade_nome}/{e.uf} ·{' '}
                      {formatarPeriodo(e.data_inicio, e.data_fim)} · {rotuloEntrada(e.entrada)}
                    </p>
                    <p className="mt-2 text-sm text-suave">{e.descricao}</p>
                    <p className="mt-2 text-xs text-suave">
                      Organização: {e.organizador_nome} — contato:{' '}
                      {e.organizador_contato || e.criado_por_email || '—'}
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
        </>
      )}
    </div>
  )
}
