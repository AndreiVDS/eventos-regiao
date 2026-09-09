import { Link } from 'react-router-dom'
import Carregando from '../componentes/Carregando'
import { listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'

export default function Cidades() {
  const { dados: cidades, carregando } = useAsync(() => listarCidades(), [])

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Cidades participantes</h1>
      <p className="mt-1 max-w-2xl text-suave">
        A plataforma nasce no Norte de Santa Catarina e no Vale do Aço, e cresce à medida que novas
        comunidades entram. Conheça a identidade cultural de cada cidade.
      </p>

      {carregando ? (
        <Carregando />
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {cidades.map((c) => (
            <article
              key={c.slug}
              className="group flex flex-col overflow-hidden rounded-2xl bg-superficie shadow-suave ring-1 ring-borda/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-alta"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={c.imagem_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tinta/85 via-tinta/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-creme">
                  <h2 className="text-3xl leading-none">
                    {c.nome} <span className="text-lg text-creme/75">/{c.uf}</span>
                  </h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-destaque">
                    {c.regiao}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm text-suave">{c.descricao}</p>
                <Link to={`/cidades/${c.slug}`} className="btn-contorno mt-4 !py-2 text-sm">
                  Ver eventos em {c.nome}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
