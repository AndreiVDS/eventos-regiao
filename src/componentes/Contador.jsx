import { useEffect, useRef, useState } from 'react'

/** Anima de 0 até `alvo` quando entra na tela. */
export default function Contador({ alvo = 0, duracao = 900 }) {
  const [valor, setValor] = useState(0)
  const ref = useRef(null)
  const jaRodou = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const semMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (semMovimento || typeof IntersectionObserver === 'undefined') {
      setValor(alvo)
      return
    }
    const obs = new IntersectionObserver((entradas) => {
      if (!entradas[0].isIntersecting || jaRodou.current) return
      jaRodou.current = true
      const inicio = performance.now()
      const passo = (agora) => {
        const t = Math.min((agora - inicio) / duracao, 1)
        const eased = 1 - Math.pow(1 - t, 3)
        setValor(Math.round(eased * alvo))
        if (t < 1) requestAnimationFrame(passo)
      }
      requestAnimationFrame(passo)
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [alvo, duracao])

  return <span ref={ref}>{valor}</span>
}
