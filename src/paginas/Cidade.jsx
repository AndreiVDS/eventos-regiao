import { Link, useParams } from 'react-router-dom'
import CardEvento from '../componentes/CardEvento'
import Carregando from '../componentes/Carregando'
import EstadoVazio from '../componentes/EstadoVazio'
import NaoEncontrado from './NaoEncontrado'
import { obterCidade, listarEventos } from '../lib/api'
import { useAsync } from '../lib/useAsync'

export default function Cidade() {
  const { slug } = useParams()
  const { dados: cidade, carregando } = useAsync(() => obterCidade(slug), [slug])
  const { dados: eventos } = useAsync(
    () => listarEventos({ cidade: slug, quando: 'futuros' }),
    [slug],
  )

  if (carregando) return <Carregando />
  if (!cidade) return <NaoEncontrado />

  return (
    <div>
      <div className="relative isolate overflow-hidden bg-tinta text-creme">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              'radial-gradient(1200px 400px at 15% -20%, rgba(244,180,0,0.35), transparent), radial-gradient(900px 500px at 100% 120%, rgba(244,180,0,0.15), transparent)',
          }}
        />
        <div className="container-pagina py-16">
          <nav aria-label="Trilha" className="text-sm text-creme/70">
            <Link to="/cidades" className="hover:underline">
              Cidades
            </Link>
          </nav>
          <h1 className="mt-2 text-5xl">
            {cidade.nome} <span className="text-2xl text-creme/70">/{cidade.uf}</span>
          </h1>
          <p className="mt-1 font-semibold text-destaque">{cidade.regiao}</p>
          <p className="mt-4 max-w-2xl text-creme/85">{cidade.descricao}</p>
          {cidade.site_prefeitura && (
            <a
              href={cidade.site_prefeitura}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-creme/80 underline hover:text-destaque"
            >
              Site oficial da prefeitura
            </a>
          )}
        </div>
      </div>

      <div className="container-pagina py-12">
        <h2 className="text-3xl">Próximos eventos em {cidade.nome}</h2>
        {!eventos ? (
          <Carregando />
        ) : eventos.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento, i) => (
              <CardEvento key={evento.id} evento={evento} indice={i} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EstadoVazio
              titulo={`Ainda não há eventos cadastrados em ${cidade.nome}`}
              descricao="Conhece um evento nesta cidade? Ajude a construir a agenda."
              acao={
                <Link to="/divulgue" className="btn-destaque">
                  Divulgue um evento
                </Link>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
