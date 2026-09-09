import { useEffect, useRef } from 'react'

/** Fininha barra no topo da janela que mostra o quanto a página já foi rolada. */
export default function BarraRolagem() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let ticking = false
    const atualizar = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const p = max > 0 ? Math.min(h.scrollTop / max, 1) : 0
      el.style.setProperty('--progresso', String(p))
      ticking = false
    }
    const aoRolar = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(atualizar)
    }
    atualizar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [])

  return <div ref={ref} className="barra-rolagem" aria-hidden="true" />
}
