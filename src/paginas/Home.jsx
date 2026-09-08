import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CardEvento from '../componentes/CardEvento'
import Carregando from '../componentes/Carregando'
import { listarEventos, listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { CATEGORIAS } from '../lib/formatacao'

export default function Home() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')

  const { dados: eventos, carregando } = useAsync(() => listarEventos({ quando: 'futuros' }), [])
  const { dados: cidades } = useAsync(() => listarCidades(), [])

  const destaques = (eventos || []).slice(0, 6)

  function pesquisar(e) {
    e.preventDefault()
    navigate(`/eventos?busca=${encodeURIComponent(busca.trim())}`)
  }

  return (
    <>
      {/* Herói */}
      <section className="relative isolate overflow-hidden bg-tinta text-creme">
        <img
          src="/img/jaragua-do-sul-vista-de-cima.jpg"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
        />
        <div className="container-pagina py-20 sm:py-28">
          <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">
            Eventos que celebram a cultura da sua região
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-creme/80">
            Descubra festivais, feiras, shows, cursos e encontros comunitários perto de você — e
            ajude organizadores locais a alcançar mais gente.
          </p>

          <form onSubmit={pesquisar} role="search" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label htmlFor="busca-home" className="sr-only">
              Buscar eventos
            </label>
            <input
              id="busca-home"
              type="search"
              className="campo flex-1 !text-tinta"
              placeholder="Buscar por evento, cidade ou tema"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button type="submit" className="btn-destaque">
              Buscar eventos
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIAS.map((c) => (
              <Link
                key={c.valor}
                to={`/eventos?categoria=${c.valor}`}
                className="rounded-full border border-creme/30 px-3 py-1 text-sm hover:bg-creme hover:text-tinta"
              >
                {c.emoji} {c.rotulo}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Eventos em destaque */}
      <section className="container-pagina py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl">Próximos eventos</h2>
            <p className="text-tinta/70">Selecionados na agenda das cidades participantes.</p>
          </div>
          <Link to="/eventos" className="btn-contorno !py-2 text-sm">
            Ver todos
          </Link>
        </div>

        {carregando ? (
          <Carregando />
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((evento) => (
              <CardEvento key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </section>

      {/* Cidades */}
      {cidades && (
        <section className="bg-white py-14">
          <div className="container-pagina">
            <h2 className="text-3xl">Explore por cidade</h2>
            <p className="text-tinta/70">
              Cada cidade tem sua identidade, suas tradições e sua própria agenda.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cidades.map((c) => (
                <Link
                  key={c.slug}
                  to={`/cidades/${c.slug}`}
                  className="group relative overflow-hidden rounded-xl ring-1 ring-tinta/10"
                >
                  <img
                    src={c.imagem_url}
                    alt={`Foto de ${c.nome}`}
                    className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/90 to-transparent p-4 text-creme">
                    <h3 className="text-2xl">
                      {c.nome}
                      <span className="text-base text-creme/70"> /{c.uf}</span>
                    </h3>
                    <p className="text-sm text-creme/80">{c.regiao}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="container-pagina py-14">
        <h2 className="text-3xl">Como funciona</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              n: '1',
              t: 'Descubra',
              d: 'Busque e filtre eventos por cidade, categoria, data e tipo de entrada. Tudo em um só lugar.',
            },
            {
              n: '2',
              t: 'Participe',
              d: 'Veja detalhes, local no mapa e link oficial para ingressos ou inscrição.',
            },
            {
              n: '3',
              t: 'Divulgue',
              d: 'É organizador? Cadastre seu evento gratuitamente e alcance moradores e turistas.',
            },
          ].map((p) => (
            <div key={p.n} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-tinta/10">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destaque font-titulo text-xl text-tinta">
                {p.n}
              </span>
              <h3 className="mt-4 text-xl">{p.t}</h3>
              <p className="mt-1 text-tinta/70">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chamada para organizadores */}
      <section className="bg-destaque">
        <div className="container-pagina flex flex-col items-start gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl text-tinta">Tem um evento na sua cidade?</h2>
            <p className="mt-1 max-w-xl text-tinta/80">
              Grandes ou pequenos, todos os eventos que fortalecem a cultura e a economia local têm
              espaço aqui. O cadastro é gratuito.
            </p>
          </div>
          <Link to="/divulgue" className="btn-tinta shrink-0">
            Divulgue seu evento
          </Link>
        </div>
      </section>
    </>
  )
}
