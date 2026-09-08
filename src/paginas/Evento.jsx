import { Link, useParams } from 'react-router-dom'
import Selo from '../componentes/Selo'
import Carregando from '../componentes/Carregando'
import NaoEncontrado from './NaoEncontrado'
import { obterEvento } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import {
  emojiCategoria,
  rotuloCategoria,
  rotuloEntrada,
  formatarPeriodo,
  eventoJaPassou,
} from '../lib/formatacao'

export default function Evento() {
  const { id } = useParams()
  const { dados: evento, carregando } = useAsync(() => obterEvento(id), [id])

  if (carregando) return <Carregando />
  if (!evento) return <NaoEncontrado />

  const consultaMapa = encodeURIComponent(
    `${evento.local}, ${evento.endereco}, ${evento.cidade_nome}`,
  )
  const mapa = `https://www.google.com/maps?q=${consultaMapa}&output=embed`
  const mapaLink = `https://www.google.com/maps/search/?api=1&query=${consultaMapa}`

  return (
    <article>
      <div className="relative isolate overflow-hidden bg-tinta text-creme">
        <img
          src={evento.imagem_url}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-40 blur-sm"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(180deg, rgba(31,30,31,0.55), rgba(31,30,31,0.92))' }}
        />
        <div className="container-pagina py-14">
          <nav aria-label="Trilha" className="text-sm text-creme/70">
            <Link to="/eventos" className="hover:underline">
              Eventos
            </Link>{' '}
            /{' '}
            <Link to={`/cidades/${evento.cidade}`} className="hover:underline">
              {evento.cidade_nome}
            </Link>
          </nav>
          <div className="mt-3 flex flex-wrap gap-2">
            <Selo tom="destaque">
              {emojiCategoria(evento.categoria)} {rotuloCategoria(evento.categoria)}
            </Selo>
            <Selo tom="escuro">{rotuloEntrada(evento.entrada)}</Selo>
            {eventoJaPassou(evento) && <Selo tom="escuro">Encerrado</Selo>}
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl sm:text-5xl">{evento.titulo}</h1>
        </div>
      </div>

      <div className="container-pagina grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <img
            src={evento.imagem_url}
            alt={`Imagem de divulgação de ${evento.titulo}`}
            className="mb-8 aspect-[16/9] w-full rounded-xl object-cover ring-1 ring-tinta/10"
          />
          <h2 className="text-2xl">Sobre o evento</h2>
          <p className="mt-3 whitespace-pre-line text-tinta/80">
            {evento.descricao_completa || evento.descricao}
          </p>

          <h2 className="mt-10 text-2xl">Local</h2>
          <p className="mt-2 text-tinta/80">
            <strong>{evento.local}</strong>
            <br />
            {evento.endereco} — {evento.cidade_nome}/{evento.uf}
          </p>
          <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-tinta/10">
            <iframe
              title={`Mapa de ${evento.local}`}
              src={mapa}
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={mapaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-tinta underline hover:text-tinta/70"
          >
            Abrir no Google Maps
          </a>
        </div>

        <aside className="h-fit rounded-xl bg-white p-6 shadow-sm ring-1 ring-tinta/10">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-tinta">🗓️ Data</dt>
              <dd className="text-tinta/80">
                {formatarPeriodo(evento.data_inicio, evento.data_fim)}
              </dd>
            </div>
            {evento.horario && (
              <div>
                <dt className="font-semibold text-tinta">⏰ Horário</dt>
                <dd className="text-tinta/80">{evento.horario}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-tinta">🎟️ Entrada</dt>
              <dd className="text-tinta/80">
                {rotuloEntrada(evento.entrada)}
                {evento.preco_texto ? ` — ${evento.preco_texto}` : ''}
              </dd>
            </div>
            {evento.organizador_nome && (
              <div>
                <dt className="font-semibold text-tinta">🧑‍🤝‍🧑 Organização</dt>
                <dd className="text-tinta/80">{evento.organizador_nome}</dd>
              </div>
            )}
          </dl>

          {evento.link_oficial && (
            <a
              href={evento.link_oficial}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-destaque mt-6 w-full"
            >
              Site oficial / ingressos
            </a>
          )}
        </aside>
      </div>
    </article>
  )
}
