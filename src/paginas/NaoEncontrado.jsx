import { Link } from 'react-router-dom'

export default function NaoEncontrado() {
  return (
    <div className="container-pagina flex flex-col items-center py-24 text-center">
      <p className="font-titulo text-7xl text-destaque">404</p>
      <h1 className="mt-2 text-3xl">Página não encontrada</h1>
      <p className="mt-2 text-suave">O endereço que você acessou não existe ou foi movido.</p>
      <Link to="/" className="btn-destaque mt-6">
        Voltar para o início
      </Link>
    </div>
  )
}
