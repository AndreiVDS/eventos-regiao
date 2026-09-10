import { Link } from 'react-router-dom'

export default function Rodape() {
  return (
    <footer className="mt-16 bg-tinta text-creme">
      <div className="container-pagina grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="font-titulo text-2xl tracking-wider">Eventos Região</h2>
          <p className="mt-2 max-w-xs text-sm text-creme/70">
            Plataforma inclusiva para descobrir e divulgar eventos culturais, esportivos e
            comunitários, fortalecendo o turismo e a economia local.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h3 className="font-titulo text-lg tracking-wide text-destaque">Navegar</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/eventos" className="hover:text-destaque">Todos os eventos</Link></li>
            <li><Link to="/cidades" className="hover:text-destaque">Cidades</Link></li>
            <li><Link to="/divulgue" className="hover:text-destaque">Divulgue seu evento</Link></li>
            <li><Link to="/sobre" className="hover:text-destaque">Sobre o projeto</Link></li>
            <li><Link to="/contato" className="hover:text-destaque">Contato</Link></li>
            <li><Link to="/privacidade" className="hover:text-destaque">Privacidade e dados</Link></li>
            <li><Link to="/termos" className="hover:text-destaque">Termos de uso</Link></li>
            <li><Link to="/creditos" className="hover:text-destaque">Créditos das imagens</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="font-titulo text-lg tracking-wide text-destaque">Projeto de Extensão</h3>
          <p className="mt-2 text-sm text-creme/70">
            Atividade Extensionista III — Tecnologia Aplicada à Inclusão Digital
            <br />
            Engenharia de Software — UNINTER
          </p>
          <p className="mt-2 text-xs text-creme/50">ODS 8 · ODS 11</p>
        </div>

        <div>
          <h3 className="font-titulo text-lg tracking-wide text-destaque">Contato</h3>
          <p className="mt-2 text-sm text-creme/70">
            Dúvidas ou quer sua cidade na plataforma?{' '}
            <Link to="/contato" className="underline hover:text-destaque">Fale com a equipe</Link>.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-creme/50">
        © {new Date().getFullYear()} Eventos Região · Andrei Vinícius · Gabriel Lenhardt · Gabriel
        Augusto — Projeto acadêmico sem fins lucrativos
      </div>
    </footer>
  )
}
