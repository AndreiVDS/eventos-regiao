import { useRevelar } from '../lib/useRevelar'

/** <section> que aparece suavemente ao entrar na tela. */
export default function Secao({ children, className = '', ...resto }) {
  const ref = useRevelar()
  return (
    <section ref={ref} className={`revelar ${className}`} {...resto}>
      {children}
    </section>
  )
}
