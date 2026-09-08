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
              className="flex flex-col overflow-hidden rounded-xl bg-superficie shadow-sm ring-1 ring-borda/10"
            >
              <img
                src={c.imagem_url}
                alt={`Foto de ${c.nome}`}
                className="h-52 w-full object-cover"
                loading="lazy"
              />
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-2xl">
                  {c.nome} <span className="text-base text-suave">/{c.uf}</span>
                </h2>
                <p className="text-sm font-semibold text-suave">{c.regiao}</p>
                <p className="mt-2 flex-1 text-sm text-suave">{c.descricao}</p>
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
