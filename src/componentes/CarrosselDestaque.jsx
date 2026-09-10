import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Selo from './Selo'
import { formatarPeriodo, emojiCategoria, rotuloCategoria } from '../lib/formatacao'
import { ehPatrocinado } from '../lib/api'

const INTERVALO = 8000
const CURVA = 'cubic-bezier(0.16, 1, 0.3, 1)' // saída suave ("assenta" no fim)

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
  const [arrastoX, setArrastoX] = useState(0) // deslocamento do dedo, em px
  const [arrastando, setArrastando] = useState(false)
  const caixaRef = useRef(null)
  const inicio = useRef(null)

  const n = itens.length
  const ir = useCallback((alvo) => setI(((alvo % n) + n) % n), [n])
  const tocando = pausado || arrastando || reduzido || n < 2

  useEffect(() => {
    if (tocando) return
    const t = setInterval(() => setI((v) => (v + 1) % n), INTERVALO)
    return () => clearInterval(t)
  }, [tocando, n])

  if (n === 0) return null

  function aoTeclar(e) {
    if (e.key === 'ArrowLeft') ir(i - 1)
    if (e.key === 'ArrowRight') ir(i + 1)
  }

  function pointerDown(e) {
    if (n < 2) return
    inicio.current = { x: e.clientX, y: e.clientY, capturado: false }
  }
  function pointerMove(e) {
    if (!inicio.current) return
    const dx = e.clientX - inicio.current.x
    const dy = e.clientY - inicio.current.y
    // só assume o gesto como "arrastar carrossel" se for mais horizontal
    if (!inicio.current.capturado) {
      if (Math.abs(dx) < 8) return
      if (Math.abs(dy) > Math.abs(dx)) {
        inicio.current = null
        return
      }
      inicio.current.capturado = true
      setArrastando(true)
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      } catch {
        /* ponteiro sintético ou já liberado */
      }
    }
    setArrastoX(dx)
  }
  function pointerUp() {
    if (!inicio.current) return
    const dx = arrastoX
    const largura = caixaRef.current?.offsetWidth || 1
    inicio.current = null
    setArrastando(false)
    setArrastoX(0)
    if (dx <= -largura * 0.18) ir(i + 1)
    else if (dx >= largura * 0.18) ir(i - 1)
  }

  const deslocamento = `calc(${-i * 100}% + ${arrastando ? arrastoX : 0}px)`

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
        <h2 className="titulo-secao text-3xl">Em destaque</h2>
        {n > 1 && !reduzido && (
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
        ref={caixaRef}
        className="relative h-[21rem] touch-pan-y overflow-hidden rounded-2xl bg-tinta text-creme shadow-media sm:h-[27rem]"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        {/* trilho que desliza */}
        <div
          className="flex h-full"
          style={{
            transform: `translate3d(${deslocamento}, 0, 0)`,
            transition: arrastando || reduzido ? 'none' : `transform 0.7s ${CURVA}`,
          }}
        >
          {itens.map((e, idx) => {
            const dist = idx - i
            const ativo = dist === 0
            const perto = Math.abs(dist) <= 1
            // vizinhos ficam menores, levemente inclinados e mais escuros:
            // dá sensação de profundidade sem sair do plano.
            const estiloSlide = reduzido
              ? undefined
              : {
                  transform: `perspective(1400px) rotateY(${ativo ? 0 : dist < 0 ? 6 : -6}deg) scale(${ativo ? 1 : 0.94})`,
                  opacity: arrastando ? 1 : ativo ? 1 : 0.45,
                  transition: arrastando ? 'none' : `transform 0.7s ${CURVA}, opacity 0.7s ease`,
                  transformOrigin: dist < 0 ? 'right center' : 'left center',
                }
            return (
              <article
                key={e.id}
                className="relative h-full w-full shrink-0 select-none overflow-hidden"
                style={estiloSlide}
                aria-hidden={idx !== i}
              >
                <img
                  src={e.imagem_url}
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
                  style={{
                    filter: 'blur(16px) saturate(1.25)',
                    transform: 'scale(1.12)',
                    // zoom lento enquanto o slide está na tela
                    animation: !reduzido && ativo ? 'ken-burns 9s ease-out both' : 'none',
                  }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  draggable="false"
                />
                {perto && (
                  <img
                    src={e.imagem_url}
                    alt=""
                    className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-contain object-right p-4 sm:block"
                    loading="lazy"
                    draggable="false"
                    style={
                      reduzido
                        ? undefined
                        : {
                            transform: ativo ? 'translateX(0) scale(1)' : 'translateX(32px) scale(1.05)',
                            opacity: ativo ? 1 : 0,
                            transition: `transform 0.9s ${CURVA}, opacity 0.6s ease`,
                          }
                    }
                  />
                )}
                <div
                  className="absolute inset-0 sm:hidden"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(20,19,20,0.30) 0%, rgba(20,19,20,0.55) 55%, rgba(20,19,20,0.96) 100%)',
                  }}
                />
                <div
                  className="absolute inset-0 hidden sm:block"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(20,19,20,0.96) 0%, rgba(20,19,20,0.82) 42%, rgba(20,19,20,0.12) 100%)',
                  }}
                />
                <div
                  className="relative flex h-full flex-col justify-end gap-3 p-6 sm:max-w-[58%] sm:p-10"
                  style={
                    reduzido
                      ? undefined
                      : {
                          transform: ativo ? 'translateY(0)' : 'translateY(26px)',
                          opacity: ativo ? 1 : 0,
                          transition: `transform 0.8s ${CURVA}, opacity 0.7s ease`,
                          transitionDelay: ativo ? '0.15s' : '0s',
                        }
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    <Selo tom="destaque">
                      {emojiCategoria(e.categoria)} {rotuloCategoria(e.categoria)}
                    </Selo>
                    <Selo tom="escuro">
                      {e.cidade_nome}/{e.uf}
                    </Selo>
                    {ehPatrocinado(e) && <Selo tom="escuro">✨ Patrocinado</Selo>}
                  </div>
                  <h3 className="text-3xl leading-tight sm:text-5xl">{e.titulo}</h3>
                  <p className="text-creme/80">🗓️ {formatarPeriodo(e.data_inicio, e.data_fim)}</p>
                  <div>
                    <Link
                      to={`/eventos/${e.id}`}
                      className="btn-destaque mt-1"
                      tabIndex={idx === i ? 0 : -1}
                      onClick={(ev) => {
                        // se estava arrastando, não navega
                        if (arrastoX !== 0) ev.preventDefault()
                      }}
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* setas só no desktop */}
        {n > 1 && (
          <>
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

            {!tocando && (
              <div className="absolute inset-x-0 top-0 h-1 bg-creme/15">
                <div
                  key={i}
                  className="h-full origin-left bg-destaque"
                  style={{ animation: `preencher ${INTERVALO}ms linear both` }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* bolinhas FORA do card, para não cobrir o botão */}
      {n > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {itens.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Ir para o destaque ${idx + 1}`}
              aria-current={idx === i}
              className="group p-1.5"
            >
              <span
                className={`block h-2 rounded-full transition-all ${
                  idx === i ? 'w-6 bg-destaque' : 'w-2 bg-borda/25 group-hover:bg-borda/40'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
