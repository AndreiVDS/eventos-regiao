import { useEffect, useRef } from 'react'

/**
 * Revela o elemento ao entrar na viewport: adiciona a classe `visivel`.
 * Use junto com a classe `revelar` no elemento.
 *   const ref = useRevelar()
 *   <section ref={ref} className="revelar"> ...
 */
export function useRevelar({ margem = '0px 0px -10% 0px', umaVez = true } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // sem IntersectionObserver (ou sem JS de animação) → já aparece
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('visivel')
      return
    }

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add('visivel')
            if (umaVez) obs.unobserve(e.target)
          } else if (!umaVez) {
            e.target.classList.remove('visivel')
          }
        }
      },
      { rootMargin: margem, threshold: 0.05 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [margem, umaVez])

  return ref
}

/** Versão para uma lista: devolve uma função `ref` indexada com atraso escalonado. */
export function useRevelarLista(passoMs = 70) {
  const refs = useRef([])
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      refs.current.forEach((el) => el && el.classList.add('visivel'))
      return
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visivel')
            obs.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    refs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  })

  return (i) => (el) => {
    refs.current[i] = el
    if (el) el.style.setProperty('--atraso', `${i * passoMs}ms`)
  }
}
