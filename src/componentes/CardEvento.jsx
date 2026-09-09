import { Link } from 'react-router-dom'
import Selo from './Selo'
import { ehDestaque } from '../lib/api'
import {
  carimboData,
  emojiCategoria,
  rotuloCategoria,
  rotuloEntrada,
  formatarPeriodo,
  eventoJaPassou,
} from '../lib/formatacao'

export default function CardEvento({ evento, indice = 0 }) {
  const { dia, mes } = carimboData(evento.data_inicio)
  const passou = eventoJaPassou(evento)
  const destaque = !passou && ehDestaque(evento)

  return (
    <article
      className="surgir group flex flex-col overflow-hidden rounded-xl bg-superficie shadow-sm ring-1 ring-borda/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{ '--atraso': `${Math.min(indice, 8) * 60}ms` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={evento.imagem_url}
          alt={`Imagem do evento ${evento.titulo}`}
          className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-lg bg-creme px-2.5 py-1 text-tinta shadow">
          <span className="font-titulo text-xl leading-none">{dia}</span>
          <span className="text-[10px] font-bold tracking-wider">{mes}</span>
        </div>
        {passou && (
          <span className="absolute right-3 top-3 rounded bg-tinta/80 px-2 py-1 text-xs font-semibold text-creme">
            Encerrado
          </span>
        )}
        {destaque && (
          <span className="absolute right-3 top-3 rounded-full bg-destaque px-2 py-1 text-xs font-bold text-tinta shadow">
            ★ Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <Selo>
            {emojiCategoria(evento.categoria)} {rotuloCategoria(evento.categoria)}
          </Selo>
          <Selo tom={evento.entrada === 'gratuito' ? 'destaque' : 'neutro'}>
            {rotuloEntrada(evento.entrada)}
          </Selo>
        </div>

        <h3 className="text-lg leading-tight tracking-normal">
          <Link to={`/eventos/${evento.id}`} className="hover:underline">
            {evento.titulo}
          </Link>
        </h3>

        <p className="text-sm text-suave line-clamp-3">{evento.descricao}</p>

        <dl className="mt-auto space-y-1 text-sm text-suave">
          <div className="flex gap-2">
            <dt className="sr-only">Data</dt>
            <span aria-hidden="true">🗓️</span>
            <dd>{formatarPeriodo(evento.data_inicio, evento.data_fim)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="sr-only">Local</dt>
            <span aria-hidden="true">📍</span>
            <dd>
              {evento.local} ·{' '}
              <Link to={`/cidades/${evento.cidade}`} className="font-semibold hover:underline">
                {evento.cidade_nome}/{evento.uf}
              </Link>
            </dd>
          </div>
        </dl>

        <Link
          to={`/eventos/${evento.id}`}
          className="btn-contorno mt-2 w-full !py-2 text-sm"
          aria-label={`Ver detalhes de ${evento.titulo}`}
        >
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}
