import { useTema } from '../lib/tema'

const PROXIMO = { claro: 'escuro', escuro: 'sistema', sistema: 'claro' }
const ROTULO = { claro: 'Tema claro', escuro: 'Tema escuro', sistema: 'Tema do sistema' }

const ICONE = {
  claro: (
    <path
      d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66 5.66l1.41 1.41M4.93 4.93l1.41 1.41m0 11.32l-1.41 1.41M19.07 4.93l-1.41 1.41M12 8a4 4 0 100 8 4 4 0 000-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  escuro: (
    <path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  sistema: (
    <path
      d="M3 5h18v11H3zM8 20h8M12 16v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export default function BotaoTema({ className = '' }) {
  const [tema, setTema] = useTema()

  return (
    <button
      type="button"
      onClick={() => setTema(PROXIMO[tema])}
      className={`inline-flex items-center gap-2 rounded-md p-2 text-creme/80 transition-colors hover:text-destaque ${className}`}
      aria-label={`${ROTULO[tema]}. Clique para alternar.`}
      title={ROTULO[tema]}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {ICONE[tema]}
      </svg>
    </button>
  )
}
