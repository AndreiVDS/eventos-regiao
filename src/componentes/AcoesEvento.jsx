import { useEffect, useRef, useState } from 'react'
import { linkGoogleAgenda, baixarICS } from '../lib/calendario'
import { compartilharNativo, copiarLink, linksSociais } from '../lib/compartilhar'

function useFecharFora(ref, aoFechar) {
  useEffect(() => {
    const fora = (e) => ref.current && !ref.current.contains(e.target) && aoFechar()
    const esc = (e) => e.key === 'Escape' && aoFechar()
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [ref, aoFechar])
}

const itemMenu =
  'block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-texto/5'

export default function AcoesEvento({ evento }) {
  const [menu, setMenu] = useState(null) // 'cal' | 'share' | null
  const [copiado, setCopiado] = useState(false)
  const caixaRef = useRef(null)
  useFecharFora(caixaRef, () => setMenu(null))

  async function compartilhar() {
    const foi = await compartilharNativo(evento)
    if (!foi) setMenu((m) => (m === 'share' ? null : 'share'))
  }

  return (
    <div ref={caixaRef} className="flex flex-wrap gap-2">
      {/* Calendário */}
      <div className="relative">
        <button
          type="button"
          className="btn-contorno !px-3 !py-2 text-sm"
          aria-haspopup="true"
          aria-expanded={menu === 'cal'}
          onClick={() => setMenu((m) => (m === 'cal' ? null : 'cal'))}
        >
          <span aria-hidden="true">🗓️</span> Adicionar ao calendário
        </button>
        {menu === 'cal' && (
          <div className="absolute left-0 z-30 mt-2 w-56 rounded-xl bg-superficie p-2 shadow-xl ring-1 ring-borda/15">
            <a
              className={itemMenu}
              href={linkGoogleAgenda(evento)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenu(null)}
            >
              Google Agenda
            </a>
            <button
              type="button"
              className={itemMenu}
              onClick={() => {
                baixarICS(evento)
                setMenu(null)
              }}
            >
              Baixar .ics (Apple, Outlook)
            </button>
          </div>
        )}
      </div>

      {/* Compartilhar */}
      <div className="relative">
        <button
          type="button"
          className="btn-contorno !px-3 !py-2 text-sm"
          aria-haspopup="true"
          aria-expanded={menu === 'share'}
          onClick={compartilhar}
        >
          <span aria-hidden="true">🔗</span> Compartilhar
        </button>
        {menu === 'share' && (
          <div className="absolute left-0 z-30 mt-2 w-52 rounded-xl bg-superficie p-2 shadow-xl ring-1 ring-borda/15">
            <button
              type="button"
              className={itemMenu}
              onClick={async () => {
                const ok = await copiarLink(evento)
                setCopiado(ok)
                setTimeout(() => setCopiado(false), 2000)
              }}
            >
              {copiado ? '✓ Link copiado' : 'Copiar link'}
            </button>
            {linksSociais(evento).map((s) => (
              <a
                key={s.nome}
                className={itemMenu}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenu(null)}
              >
                {s.nome}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
