import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CardEvento from '../componentes/CardEvento'
import EsqueletoCards from '../componentes/EsqueletoCards'
import CarrosselDestaque from '../componentes/CarrosselDestaque'
import ChamadaLocalizacao from '../componentes/ChamadaLocalizacao'
import Contador from '../componentes/Contador'
import Secao from '../componentes/Secao'
import { listarEventos, listarCidades, listarDestaques } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { useCidadeAtual } from '../lib/cidade'
import { eventosDoFimDeSemana } from '../lib/agenda'
import { CATEGORIAS } from '../lib/formatacao'
import { useMeta } from '../lib/meta'
import { listarVistos } from '../lib/recentes'

export default function Home() {
  const navigate = useNavigate()
  useMeta({ caminho: '/' })
  const vistos = listarVistos().slice(0, 6)
  const [busca, setBusca] = useState('')
  const [cidadeSlug] = useCidadeAtual()

  const { dados: eventos, carregando } = useAsync(() => listarEventos({ quando: 'futuros' }), [])
  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const { dados: curados } = useAsync(() => listarDestaques(), [])

  const cidadeAtual = (cidades || []).find((c) => c.slug === cidadeSlug)
  const daCidade = cidadeSlug
    ? (eventos || []).filter((e) => e.cidade === cidadeSlug)
    : eventos || []
  const destaques = daCidade.slice(0, 6)

  // carrossel: usa a curadoria da equipe; se não houver, os próximos da cidade
  const curadosDaCidade = cidadeSlug
    ? (curados || []).filter((e) => e.cidade === cidadeSlug)
    : curados || []
  const carrossel = curadosDaCidade.length >= 2 ? curadosDaCidade : daCidade
  const fimDeSemana = eventosDoFimDeSemana(daCidade).slice(0, 3)

  const numeros = useMemo(() => {
    const lista = eventos || []
    return {
      eventos: lista.length,
      cidades: new Set(lista.map((e) => e.cidade)).size,
      estados: new Set(lista.map((e) => e.uf)).size,
      gratuitos: lista.filter((e) => e.entrada === 'gratuito').length,
    }
  }, [eventos])

  function pesquisar(e) {
    e.preventDefault()
    const p = new URLSearchParams()
    if (busca.trim()) p.set('busca', busca.trim())
    if (cidadeSlug) p.set('cidade', cidadeSlug)
    navigate(`/eventos?${p}`)
  }

  return (
    <>
      {/* Herói */}
      <section className="relative isolate overflow-hidden bg-tinta text-creme">
        <img
          src="/img/jaragua-do-sul-vista-de-cima.jpg"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(900px 500px at 12% -10%, rgba(244,180,0,0.22), transparent 60%), linear-gradient(180deg, rgba(31,30,31,0.35), rgba(31,30,31,0.9))',
          }}
        />
        <div
          className="animar-flutuar pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(244,180,0,0.5), transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="container-pagina py-20 sm:py-28">
          <p
            className="surgir mb-3 inline-flex items-center gap-2 rounded-full border border-creme/25 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-creme/80"
            style={{ '--atraso': '0ms' }}
          >
            Turismo · Cultura · Economia local
          </p>
          <h1 className="surgir max-w-3xl text-4xl leading-[1.05] sm:text-6xl" style={{ '--atraso': '80ms' }}>
            Eventos que celebram a cultura da sua região
          </h1>
          <p className="surgir mt-4 max-w-2xl text-lg text-creme/80" style={{ '--atraso': '160ms' }}>
            Descubra festivais, feiras, shows, cursos e encontros comunitários perto de você — e
            ajude organizadores locais a alcançar mais gente.
          </p>

          <form
            onSubmit={pesquisar}
            role="search"
            className="surgir mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            style={{ '--atraso': '240ms' }}
          >
            <label htmlFor="busca-home" className="sr-only">Buscar eventos</label>
            <input
              id="busca-home"
              type="search"
              className="campo flex-1"
              placeholder="Buscar por evento, cidade ou tema"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button type="submit" className="btn-destaque">Buscar eventos</button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIAS.map((c, i) => (
              <Link
                key={c.valor}
                to={`/eventos?categoria=${c.valor}`}
                className="surgir rounded-full border border-creme/30 px-3 py-1 text-sm transition-all hover:-translate-y-0.5 hover:border-destaque hover:bg-creme hover:text-tinta"
                style={{ '--atraso': `${360 + i * 60}ms` }}
              >
                {c.emoji} {c.rotulo}
              </Link>
            ))}
          </div>
        </div>

        {/* Faixa de números */}
        {numeros.eventos > 0 && (
          <div className="border-t border-white/10 bg-black/20">
            <dl className="container-pagina grid grid-cols-2 gap-4 py-6 text-center sm:grid-cols-4">
              {[
                ['Eventos na agenda', numeros.eventos],
                ['Cidades', numeros.cidades],
                ['Estados', numeros.estados],
                ['Gratuitos', numeros.gratuitos],
              ].map(([rotulo, valor]) => (
                <div key={rotulo}>
                  <dd className="font-titulo text-3xl text-destaque">
                    <Contador alvo={valor} />
                  </dd>
                  <dt className="text-xs uppercase tracking-wide text-creme/70">{rotulo}</dt>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {/* Convite para usar a localização */}
      {!cidadeSlug && (
        <div className="container-pagina pt-8">
          <ChamadaLocalizacao />
        </div>
      )}

      {/* Carrossel de destaques */}
      {!carregando && carrossel.length >= 2 && <CarrosselDestaque eventos={carrossel} />}

      {/* Vistos recentemente */}
      {vistos.length >= 2 && (
        <Secao className="container-pagina pt-12">
          <h2 className="titulo-secao text-2xl">Vistos recentemente</h2>
          <div className="mt-5 trilha-cards">
            {vistos.map((evento, i) => (
              <CardEvento key={evento.id} evento={evento} indice={i} />
            ))}
          </div>
        </Secao>
      )}

      {/* Próximos eventos */}
      <Secao className="container-pagina py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="titulo-secao text-3xl">
              Próximos eventos{cidadeAtual ? ` em ${cidadeAtual.nome}` : ''}
            </h2>
            <p className="text-suave">
              {cidadeAtual
                ? `Agenda de ${cidadeAtual.nome}/${cidadeAtual.uf}.`
                : 'Selecionados na agenda das cidades participantes.'}
            </p>
          </div>
          <Link
            to={cidadeSlug ? `/eventos?cidade=${cidadeSlug}` : '/eventos'}
            className="btn-contorno shrink-0 !py-2 text-sm"
          >
            Ver todos
          </Link>
        </div>

        {carregando ? (
          <EsqueletoCards />
        ) : destaques.length > 0 ? (
          <div className="mt-8 trilha-cards">
            {destaques.map((evento, i) => (
              <CardEvento key={evento.id} evento={evento} indice={i} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-xl bg-superficie p-8 text-center text-suave ring-1 ring-borda/10">
            Ainda não há eventos futuros em {cidadeAtual?.nome}.{' '}
            <Link to="/eventos" className="font-semibold text-texto underline">
              Ver todas as cidades
            </Link>
          </p>
        )}
      </Secao>

      {/* Neste fim de semana */}
      {!carregando && fimDeSemana.length > 0 && (
        <Secao className="bg-superficie py-14">
          <div className="container-pagina">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="titulo-secao text-3xl">Neste fim de semana</h2>
                <p className="text-suave">
                  O que rola no sábado e no domingo{cidadeAtual ? ` em ${cidadeAtual.nome}` : ''}.
                </p>
              </div>
              <Link
                to={`/eventos?quando=semana${cidadeSlug ? `&cidade=${cidadeSlug}` : ''}`}
                className="btn-contorno shrink-0 !py-2 text-sm"
              >
                Ver mais
              </Link>
            </div>
            <div className="mt-8 trilha-cards">
              {fimDeSemana.map((evento, i) => (
                <CardEvento key={evento.id} evento={evento} indice={i} />
              ))}
            </div>
          </div>
        </Secao>
      )}

      {/* Cidades */}
      {cidades && (
        <Secao className="py-14">
          <div className="container-pagina">
            <h2 className="titulo-secao text-3xl">Explore por cidade</h2>
            <p className="text-suave">
              Cada cidade tem sua identidade, suas tradições e sua própria agenda.
            </p>
            <div className="mt-8 trilha-cards">
              {cidades.slice(0, 9).map((c) => (
                <Link
                  key={c.slug}
                  to={`/cidades/${c.slug}`}
                  className="group relative overflow-hidden rounded-xl ring-1 ring-borda/10"
                >
                  <img
                    src={c.imagem_url}
                    alt={`Postal de ${c.nome}`}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/95 to-transparent p-4 text-creme">
                    <h3 className="text-2xl">
                      {c.nome}
                      <span className="text-base text-creme/70"> /{c.uf}</span>
                    </h3>
                    <p className="text-sm text-creme/80">{c.regiao}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/cidades" className="btn-contorno shrink-0 !py-2 text-sm">Ver todas as cidades</Link>
            </div>
          </div>
        </Secao>
      )}

      {/* Como funciona */}
      <Secao className="container-pagina py-14">
        <h2 className="titulo-secao text-3xl">Como funciona</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { n: '1', t: 'Descubra', d: 'Busque e filtre eventos por cidade, categoria, data e tipo de entrada. Tudo em um só lugar.' },
            { n: '2', t: 'Participe', d: 'Veja detalhes, local no mapa e link oficial para ingressos ou inscrição.' },
            { n: '3', t: 'Divulgue', d: 'É organizador? Cadastre seu evento gratuitamente e alcance moradores e turistas.' },
          ].map((p) => (
            <div key={p.n} className="cartao p-6 transition-transform hover:-translate-y-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destaque font-titulo text-xl text-tinta">
                {p.n}
              </span>
              <h3 className="mt-4 text-xl">{p.t}</h3>
              <p className="mt-1 text-suave">{p.d}</p>
            </div>
          ))}
        </div>
      </Secao>

      {/* Chamada para organizadores */}
      <section className="bg-destaque">
        <div className="container-pagina flex flex-col items-start gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl text-tinta">Tem um evento na sua cidade?</h2>
            <p className="mt-1 max-w-xl text-suave">
              Grandes ou pequenos, todos os eventos que fortalecem a cultura e a economia local têm
              espaço aqui. O cadastro é gratuito.
            </p>
          </div>
          <Link to="/divulgue" className="btn-tinta shrink-0">Divulgue seu evento</Link>
        </div>
      </section>
    </>
  )
}
