import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { para: '/eventos', texto: 'Eventos' },
  { para: '/cidades', texto: 'Cidades' },
  { para: '/sobre', texto: 'Sobre' },
]

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false)

  const classeLink = ({ isActive }) =>
    `px-3 py-2 rounded-md font-semibold transition-colors ${
      isActive ? 'text-destaque' : 'text-creme hover:text-destaque'
    }`

  return (
    <header className="sticky top-0 z-40 bg-tinta text-creme shadow-md">
      <div className="container-pagina flex items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setAberto(false)}>
          <img src="/favicon.svg" alt="" width="36" height="36" className="rounded-lg" />
          <span className="font-titulo text-2xl tracking-wider">Eventos Região</span>
        </Link>

        {/* Navegação em telas médias e grandes */}
        <nav aria-label="Principal" className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.para} to={l.para} className={classeLink}>
              {l.texto}
            </NavLink>
          ))}
          <Link to="/divulgue" className="btn-destaque ml-2 !py-2">
            Divulgue seu evento
          </Link>
        </nav>

        {/* Botão do menu no celular */}
        <button
          type="button"
          className="md:hidden rounded-md p-2 text-creme hover:bg-white/10"
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setAberto((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {aberto ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menu do celular */}
      {aberto && (
        <nav
          id="menu-mobile"
          aria-label="Principal (celular)"
          className="md:hidden border-t border-white/10 bg-tinta px-4 pb-4"
        >
          {links.map((l) => (
            <NavLink
              key={l.para}
              to={l.para}
              className={classeLink}
              onClick={() => setAberto(false)}
              style={{ display: 'block' }}
            >
              {l.texto}
            </NavLink>
          ))}
          <Link
            to="/divulgue"
            className="btn-destaque mt-3 w-full"
            onClick={() => setAberto(false)}
          >
            Divulgue seu evento
          </Link>
        </nav>
      )}
    </header>
  )
}
