import { Link } from 'react-router-dom'
import Carregando from '../../componentes/Carregando'
import EstadoVazio from '../../componentes/EstadoVazio'
import StatTile from '../../componentes/graficos/StatTile'
import Selo from '../../componentes/Selo'
import { listarMeusEventos } from '../../lib/api'
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

  if (carregando) return <Carregando texto="Carregando seus eventos…" />

  const lista = eventos || []
  const aprovados = lista.filter((e) => e.status === 'aprovado')
  const pendentes = lista.filter((e) => e.status === 'pendente')
  const proximos = aprovados.filter((e) => !eventoJaPassou(e))

  return (
    <div className="container-pagina py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-tinta/50">
            Área do organizador
          </p>
          <h1 className="text-4xl">Meus eventos</h1>
          <p className="mt-1 text-tinta/70">{usuario?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/organizador/novo" className="btn-destaque !py-2 text-sm">Cadastrar evento</Link>
          <button onClick={sair} className="btn-contorno !py-2 text-sm">Sair</button>
        </div>
      </div>

      {modoDemo && (
        <p className="mt-4 rounded-lg bg-destaque/20 p-3 text-sm text-tinta">
          <strong>Modo demonstração:</strong> seus eventos ficam salvos só neste navegador.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile rotulo="Total" valor={lista.length} />
        <StatTile rotulo="Publicados" valor={aprovados.length} tom="destaque" />
        <StatTile rotulo="Em revisão" valor={pendentes.length} />
        <StatTile rotulo="Ainda vão acontecer" valor={proximos.length} />
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
            return (
              <li
                key={e.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-tinta/10"
              >
                <img src={e.imagem_url} alt="" className="h-14 w-20 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{e.titulo}</p>
                  <p className="text-sm text-tinta/60">
                    {rotuloCategoria(e.categoria)} · {e.cidade_nome}/{e.uf} ·{' '}
                    {formatarPeriodo(e.data_inicio, e.data_fim)}
                  </p>
                </div>
                <Selo tom={s.tom}>{s.rotulo}</Selo>
                {e.status === 'aprovado' && (
                  <Link to={`/eventos/${e.id}`} className="text-sm font-semibold underline">
                    Ver página
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
