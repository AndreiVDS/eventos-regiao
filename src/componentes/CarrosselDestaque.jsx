import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Selo from './Selo'
import { formatarPeriodo, emojiCategoria, rotuloCategoria } from '../lib/formatacao'

const INTERVALO = 6000

export default function CarrosselDestaque({ eventos = [] }) {
  const itens = eventos.slice(0, 5)
  const [i, setI] = useState(0)
  const [pausado, setPausado] = useState(false)
  const timer = useRef(null)

  const ir = useCallback(
    (n) => setI(((n % itens.length) + itens.length) % itens.length),
    [itens.length],
  )

  useEffect(() => {
    if (pausado || itens.length < 2) return
    const semMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (semMovimento) return
    timer.current = setInterval(() => ir(i + 1), INTERVALO)
    return () => clearInterval(timer.current)
  }, [i, pausado, itens.length, ir])

  if (itens.length === 0) return null

  return (
    <section
      className="container-pagina pt-12"
      aria-roledescription="carrossel"
      aria-label="Eventos em destaque"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <h2 className="mb-4 text-3xl">Em destaque</h2>

      <div className="relative h-[22rem] overflow-hidden rounded-2xl bg-tinta text-creme shadow-lg sm:h-[28rem]">
        {itens.map((e, idx) => (
          <article
            key={e.id}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? 'auto' : 'none' }}
            aria-hidden={idx !== i}
          >
            <img
              src={e.imagem_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              style={{ filter: 'blur(22px) saturate(1.2)', transform: 'scale(1.15)' }}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(20,19,20,0.95) 0%, rgba(20,19,20,0.78) 40%, rgba(20,19,20,0.4) 100%)',
              }}
            />
            <div className="relative flex h-full flex-col justify-end gap-3 p-6 sm:p-10">
              <div className="flex flex-wrap gap-2">
                <Selo tom="destaque">
                  {emojiCategoria(e.categoria)} {rotuloCategoria(e.categoria)}
                </Selo>
                <Selo tom="escuro">
                  {e.cidade_nome}/{e.uf}
                </Selo>
              </div>
              <h3 className="max-w-2xl text-3xl leading-tight sm:text-5xl">{e.titulo}</h3>
              <p className="text-creme/80">🗓️ {formatarPeriodo(e.data_inicio, e.data_fim)}</p>
              <div>
                <Link to={`/eventos/${e.id}`} className="btn-destaque mt-1">
                  Ver detalhes
                </Link>
              </div>
            </div>
          </article>
        ))}

        {itens.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(i - 1)}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-tinta/60 p-2 text-creme backdrop-blur transition-colors hover:bg-tinta"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => ir(i + 1)}
              aria-label="Próximo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-tinta/60 p-2 text-creme backdrop-blur transition-colors hover:bg-tinta"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {itens.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  aria-label={`Ir para o destaque ${idx + 1}`}
                  aria-current={idx === i}
                  className={`h-2 rounded-full transition-all ${
                    idx === i ? 'w-6 bg-destaque' : 'w-2 bg-creme/50 hover:bg-creme/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
