import { useCallback, useEffect, useState } from 'react'
import Carregando from '../../componentes/Carregando'
import EstadoVazio from '../../componentes/EstadoVazio'
import { AbasPainel } from './Painel'
import { listarEventosPendentes, moderarEvento, listarCidades } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { formatarPeriodo, rotuloCategoria, rotuloEntrada } from '../../lib/formatacao'

export default function Moderacao() {
  const { sair } = useAuth()
  const [pendentes, setPendentes] = useState(null)
  const [processando, setProcessando] = useState(null)
  const [cidadesPendentes, setCidadesPendentes] = useState(new Set())

  const carregar = useCallback(() => {
    listarEventosPendentes().then(setPendentes).catch(() => setPendentes([]))
    listarCidades({ todas: true })
      .then((cs) => setCidadesPendentes(new Set(cs.filter((c) => c.aprovada === false).map((c) => c.slug))))
      .catch(() => {})
  }, [])

  useEffect(() => carregar(), [carregar])

  const [recusandoId, setRecusandoId] = useState(null)
  const [motivo, setMotivo] = useState('')

  async function decidir(id, status, motivoTexto = '') {
    setProcessando(id)
    try {
      await moderarEvento(id, status, motivoTexto)
      setPendentes((lista) => lista.filter((e) => e.id !== id))
      setRecusandoId(null)
      setMotivo('')
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
                    {cidadesPendentes.has(e.cidade) && (
                      <p className="mt-1 inline-block rounded bg-destaque/15 px-2 py-0.5 text-xs font-semibold text-texto">
                        🆕 Cidade nova: {e.cidade_nome}/{e.uf} — entra no ar ao aprovar
                      </p>
                    )}
                    <p className="mt-2 text-sm text-suave">{e.descricao}</p>
                    <p className="mt-2 text-xs text-suave">
                      Organização: {e.organizador_nome} — contato:{' '}
                      {e.organizador_contato || e.criado_por_email || '—'}
                    </p>
                    {recusandoId === e.id ? (
                      <div className="mt-4 rounded-lg bg-texto/5 p-3">
                        <label className="rotulo text-sm" htmlFor={`motivo-${e.id}`}>
                          Motivo da recusa <span className="text-suave">(opcional, o organizador vê)</span>
                        </label>
                        <textarea
                          id={`motivo-${e.id}`}
                          rows="2"
                          className="campo text-sm"
                          value={motivo}
                          onChange={(ev) => setMotivo(ev.target.value)}
                          placeholder="Ex.: faltou o endereço completo; imagem com direitos de terceiros…"
                        />
                        <div className="mt-2 flex gap-3">
                          <button
                            className="btn-contorno !py-2 text-sm"
                            disabled={processando === e.id}
                            onClick={() => decidir(e.id, 'recusado', motivo)}
                          >
                            Confirmar recusa
                          </button>
                          <button
                            className="btn-fantasma !py-2 text-sm"
                            onClick={() => {
                              setRecusandoId(null)
                              setMotivo('')
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
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
                          onClick={() => {
                            setRecusandoId(e.id)
                            setMotivo('')
                          }}
                        >
                          Recusar
                        </button>
                      </div>
                    )}
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
