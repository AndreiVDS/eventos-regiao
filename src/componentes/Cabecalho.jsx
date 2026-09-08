import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import BotaoTema from './BotaoTema'
import SeletorCidade from './SeletorCidade'

const linksPublicos = [
  { para: '/eventos', texto: 'Eventos' },
  { para: '/cidades', texto: 'Cidades' },
  { para: '/sobre', texto: 'Sobre' },
]

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false)
  const { autenticado, ehEquipe, sair } = useAuth()
  const fechar = () => setAberto(false)

  const classeLink = ({ isActive }) =>
    `px-3 py-2 rounded-md font-semibold transition-colors ${
      isActive ? 'text-destaque' : 'text-creme hover:text-destaque'
    }`

  const areaLogada = ehEquipe
    ? { para: '/painel', texto: 'Painel' }
    : { para: '/organizador', texto: 'Minha área' }

  return (
    <header className="sticky top-0 z-40 bg-tinta text-creme shadow-md">
      <div className="container-pagina flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center gap-2" onClick={fechar}>
            <img src="/favicon.svg" alt="" width="36" height="36" className="rounded-lg" />
            <span className="font-titulo text-2xl tracking-wider">Eventos Região</span>
          </Link>
          <span className="mx-1 hidden h-6 w-px bg-white/15 md:block" />
          <SeletorCidade classe="hidden md:block" />
        </div>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {linksPublicos.map((l) => (
            <NavLink key={l.para} to={l.para} className={classeLink}>
              {l.texto}
            </NavLink>
          ))}
          {autenticado ? (
            <>
              <NavLink to={areaLogada.para} className={classeLink}>{areaLogada.texto}</NavLink>
              <button onClick={sair} className="px-3 py-2 font-semibold text-creme/70 hover:text-destaque">
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/entrar" className={classeLink}>Entrar</NavLink>
          )}
          <BotaoTema className="ml-1" />
          <Link to="/divulgue" className="btn-destaque ml-1 !py-2">Divulgue seu evento</Link>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
        <BotaoTema />
        <button
          type="button"
          className="rounded-md p-2 text-creme hover:bg-white/10"
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setAberto((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {aberto ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
        </div>
      </div>

      {aberto && (
        <nav
          id="menu-mobile"
          aria-label="Principal (celular)"
          className="border-t border-white/10 bg-tinta px-4 pb-4 md:hidden"
        >
          <div className="py-2">
            <SeletorCidade />
          </div>
          {linksPublicos.map((l) => (
            <NavLink key={l.para} to={l.para} className={classeLink} onClick={fechar} style={{ display: 'block' }}>
              {l.texto}
            </NavLink>
          ))}
          {autenticado ? (
            <>
              <NavLink to={areaLogada.para} className={classeLink} onClick={fechar} style={{ display: 'block' }}>
                {areaLogada.texto}
              </NavLink>
              <button
                onClick={() => { fechar(); sair() }}
                className="block px-3 py-2 font-semibold text-creme/70"
              >
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/entrar" className={classeLink} onClick={fechar} style={{ display: 'block' }}>
              Entrar
            </NavLink>
          )}
          <Link to="/divulgue" className="btn-destaque mt-3 w-full" onClick={fechar}>
            Divulgue seu evento
          </Link>
        </nav>
      )}
    </header>
  )
}
