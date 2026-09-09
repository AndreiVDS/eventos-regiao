import { Link } from 'react-router-dom'
import Carregando from '../../componentes/Carregando'
import EstadoVazio from '../../componentes/EstadoVazio'
import StatTile from '../../componentes/graficos/StatTile'
import Selo from '../../componentes/Selo'
import SolicitarDestaque from '../../componentes/SolicitarDestaque'
import { listarMeusEventos } from '../../lib/api'
import { contarPresencasEm } from '../../lib/presenca'
import { useAuth } from '../../lib/auth'
import { useAsync } from '../../lib/useAsync'
import { formatarPeriodo, rotuloCategoria, eventoJaPassou } from '../../lib/formatacao'

const STATUS = {
  aprovado: { rotulo: 'Publicado', tom: 'destaque' },
  pendente: { rotulo: 'Em revisão', tom: 'neutro' },
  recusado: { rotulo: 'Não aprovado', tom: 'escuro' },
}

export default function MinhaArea() {
  const { usuario, sair, modoDemo } = useAuth()
  const { dados: eventos, carregando } = useAsync(() => listarMeusEventos(usuario), [usuario?.id])
  const ids = (eventos || []).map((e) => e.id)
  const { dados: presencas } = useAsync(() => contarPresencasEm(ids), [ids.join(',')])

  if (carregando) return <Carregando texto="Carregando seus eventos…" />

  const lista = eventos || []
  const aprovados = lista.filter((e) => e.status === 'aprovado')
  const pendentes = lista.filter((e) => e.status === 'pendente')
  const proximos = aprovados.filter((e) => !eventoJaPassou(e))
  const totalConfirmados = Object.values(presencas || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="container-pagina py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-suave/80">
            Área do organizador
          </p>
          <h1 className="text-4xl">Meus eventos</h1>
          <p className="mt-1 text-suave">{usuario?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/organizador/novo" className="btn-destaque !py-2 text-sm">Cadastrar evento</Link>
          <button onClick={sair} className="btn-contorno !py-2 text-sm">Sair</button>
        </div>
      </div>

      {modoDemo && (
        <p className="mt-4 rounded-lg border-l-4 border-destaque bg-destaque/10 p-3 text-sm text-texto">
          <strong>Modo demonstração:</strong> seus eventos ficam salvos só neste navegador.
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile rotulo="Publicados" valor={aprovados.length} tom="destaque" />
        <StatTile rotulo="Em revisão" valor={pendentes.length} />
        <StatTile rotulo="Ainda vão acontecer" valor={proximos.length} />
        <StatTile rotulo="Confirmações" valor={totalConfirmados} detalhe="pessoas que vão participar" />
      </div>

      <h2 className="mt-10 text-2xl">Histórico</h2>
      {lista.length === 0 ? (
        <div className="mt-4">
          <EstadoVazio
            titulo="Você ainda não cadastrou eventos"
            descricao="Cadastre seu primeiro evento — leva poucos minutos e o envio é gratuito."
            acao={<Link to="/organizador/novo" className="btn-destaque">Cadastrar evento</Link>}
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {lista.map((e) => {
            const s = STATUS[e.status] || STATUS.pendente
            const confirmados = e.status === 'aprovado' ? presencas?.[e.id] || 0 : 0
            return (
              <li
                key={e.id}
                className="flex gap-3 rounded-xl bg-superficie p-3 shadow-suave ring-1 ring-borda/10 sm:gap-4 sm:p-4"
              >
                <img
                  src={e.imagem_url}
                  alt=""
                  className="h-16 w-20 shrink-0 rounded-lg object-cover sm:h-16 sm:w-28"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug line-clamp-2">{e.titulo}</p>
                  <p className="mt-0.5 text-sm text-suave">
                    {rotuloCategoria(e.categoria)} · {e.cidade_nome}/{e.uf}
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline"> · </span>
                    {formatarPeriodo(e.data_inicio, e.data_fim)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Selo tom={s.tom}>{s.rotulo}</Selo>
                    {e.status === 'pendente' && (
                      <span className="text-sm text-suave">aguardando a equipe revisar</span>
                    )}
                    {confirmados > 0 && (
                      <span className="text-sm text-suave">
                        ✋ {confirmados} confirmado{confirmados === 1 ? '' : 's'}
                      </span>
                    )}
                    {e.status === 'aprovado' && (
                      <Link
                        to={`/eventos/${e.id}`}
                        className="text-sm font-semibold text-texto underline hover:text-suave"
                      >
                        Ver página
                      </Link>
                    )}
                  </div>
                  {e.status === 'aprovado' && !eventoJaPassou(e) && (
                    <div className="mt-2">
                      <SolicitarDestaque evento={e} />
                    </div>
                  )}
                  {e.status === 'recusado' && (
                    <p className="mt-2 rounded-lg bg-red-100 p-2 text-sm text-red-800 dark:bg-red-950/60 dark:text-red-200">
                      {e.motivo_recusa
                        ? `Motivo: ${e.motivo_recusa}`
                        : 'A equipe não aprovou este envio. Ajuste as informações e cadastre de novo.'}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
