import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Selo from './Selo'
import { formatarPeriodo, emojiCategoria, rotuloCategoria } from '../lib/formatacao'

const INTERVALO = 5000

function semMovimento() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

export default function CarrosselDestaque({ eventos = [] }) {
  const itens = eventos.slice(0, 5)
  const [i, setI] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [reduzido] = useState(semMovimento)
  const timer = useRef(null)
  const arraste = useRef(null)

  const ir = useCallback(
    (n) => setI(((n % itens.length) + itens.length) % itens.length),
    [itens.length],
  )

  const tocando = pausado || reduzido || itens.length < 2

  useEffect(() => {
    if (tocando) return
    timer.current = setInterval(() => setI((v) => (v + 1) % itens.length), INTERVALO)
    return () => clearInterval(timer.current)
  }, [tocando, itens.length])

  if (itens.length === 0) return null

  function aoTeclar(e) {
    if (e.key === 'ArrowLeft') ir(i - 1)
    if (e.key === 'ArrowRight') ir(i + 1)
  }

  function inicioArraste(e) {
    arraste.current = { x: e.clientX, y: e.clientY }
  }
  function fimArraste(e) {
    if (!arraste.current) return
    const dx = e.clientX - arraste.current.x
    const dy = e.clientY - arraste.current.y
    arraste.current = null
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) ir(i + (dx < 0 ? 1 : -1))
  }

  return (
    <section
      className="container-pagina pt-12"
      aria-roledescription="carrossel"
      aria-label="Eventos em destaque"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onKeyDown={aoTeclar}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl">Em destaque</h2>
        {itens.length > 1 && !reduzido && (
          <button
            type="button"
            onClick={() => setPausado((p) => !p)}
            className="rounded-md p-2 text-suave transition-colors hover:text-texto"
            aria-label={pausado ? 'Retomar troca automática' : 'Pausar troca automática'}
          >
            {pausado ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div
        className="relative h-[22rem] touch-pan-y select-none overflow-hidden rounded-2xl bg-tinta text-creme shadow-lg sm:h-[28rem]"
        onPointerDown={inicioArraste}
        onPointerUp={fimArraste}
      >
        {itens.map((e, idx) => {
          const ativo = idx === i
          return (
            <article
              key={e.id}
              className="absolute inset-0 transition-opacity duration-700 ease-out"
              style={{ opacity: ativo ? 1 : 0, pointerEvents: ativo ? 'auto' : 'none' }}
              aria-hidden={!ativo}
            >
              <img
                src={e.imagem_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70"
                style={{
                  filter: 'blur(18px) saturate(1.25)',
                  transform: 'scale(1.15)',
                  animation: ativo && !reduzido ? 'ken-burns 6s ease-out both' : 'none',
                }}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              {/* pôster nítido à direita no desktop */}
              <img
                src={e.imagem_url}
                alt=""
                className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-contain object-right p-4 sm:block"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              <div
                className="absolute inset-0 sm:hidden"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(20,19,20,0.35) 0%, rgba(20,19,20,0.55) 55%, rgba(20,19,20,0.95) 100%)',
                }}
              />
              <div
                className="absolute inset-0 hidden sm:block"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(20,19,20,0.96) 0%, rgba(20,19,20,0.82) 42%, rgba(20,19,20,0.15) 100%)',
                }}
              />
              {ativo && (
                <div
                  key={i}
                  className="relative flex h-full flex-col justify-end gap-3 p-6 sm:max-w-[58%] sm:p-10"
                >
                  <div className="surgir flex flex-wrap gap-2" style={{ '--atraso': '60ms' }}>
                    <Selo tom="destaque">
                      {emojiCategoria(e.categoria)} {rotuloCategoria(e.categoria)}
                    </Selo>
                    <Selo tom="escuro">
                      {e.cidade_nome}/{e.uf}
                    </Selo>
                  </div>
                  <h3
                    className="surgir max-w-2xl text-3xl leading-tight sm:text-5xl"
                    style={{ '--atraso': '120ms' }}
                  >
                    {e.titulo}
                  </h3>
                  <p className="surgir text-creme/80" style={{ '--atraso': '180ms' }}>
                    🗓️ {formatarPeriodo(e.data_inicio, e.data_fim)}
                  </p>
                  <div className="surgir" style={{ '--atraso': '240ms' }}>
                    <Link to={`/eventos/${e.id}`} className="btn-destaque mt-1">
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              )}
            </article>
          )
        })}

        {itens.length > 1 && (
          <>
            {/* setas só no desktop; no celular vale o arrastar + as bolinhas */}
            <button
              type="button"
              onClick={() => ir(i - 1)}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-tinta/60 p-2 text-creme backdrop-blur transition-all hover:scale-110 hover:bg-tinta sm:block"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => ir(i + 1)}
              aria-label="Próximo"
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-tinta/60 p-2 text-creme backdrop-blur transition-all hover:scale-110 hover:bg-tinta sm:block"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* barra de progresso do slide atual */}
            {!tocando && (
              <div className="absolute inset-x-0 top-0 h-1 bg-creme/15">
                <div
                  key={i}
                  className="h-full origin-left bg-destaque"
                  style={{ animation: `preencher ${INTERVALO}ms linear both` }}
                />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 pb-3">
              {itens.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  aria-label={`Ir para o destaque ${idx + 1}`}
                  aria-current={idx === i}
                  className="group px-1.5 py-2"
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      idx === i ? 'w-6 bg-destaque' : 'w-2 bg-creme/50 group-hover:bg-creme/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
