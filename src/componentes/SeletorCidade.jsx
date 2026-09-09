import { useEffect, useMemo, useRef, useState } from 'react'
import { listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import {
  useCidadeAtual,
  useLocalizacao,
  usePermissaoGeo,
  resolverLocalizacao,
  formatarDistancia,
  RAIOS,
} from '../lib/cidade'

function normalizar(t = '') {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function IconePin({ className = '' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconeAlvo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function SeletorCidade({ classe = '' }) {
  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const [slug, definir] = useCidadeAtual()
  const { coords, raioKm, definirCoords, definirRaio } = useLocalizacao()
  const permissao = usePermissaoGeo()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  // null | 'buscando' | { tom: 'ok' | 'aviso' | 'erro', texto }
  const [gpsEstado, setGpsEstado] = useState(null)
  const caixaRef = useRef(null)

  const atual = (cidades || []).find((c) => c.slug === slug)
  const rotulo = atual ? atual.nome : coords ? 'Perto de mim' : 'Todas as cidades'
  const negada = permissao === 'negada'

  const lista = useMemo(() => {
    const cs = cidades || []
    if (!busca.trim()) return cs
    const b = normalizar(busca)
    return cs.filter((c) => normalizar(`${c.nome} ${c.uf} ${c.regiao}`).includes(b))
  }, [cidades, busca])

  useEffect(() => {
    if (!aberto) return
    const fora = (e) => {
      if (caixaRef.current && !caixaRef.current.contains(e.target)) setAberto(false)
    }
    const esc = (e) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  function escolher(novo) {
    definir(novo)
    setAberto(false)
    setBusca('')
  }

  async function usarGps() {
    setGpsEstado('buscando')
    try {
      const r = await resolverLocalizacao(cidades || [])
      definirCoords(r.ponto)
      setBusca('')
      const dist = formatarDistancia(r.distanciaKm)
      if (r.dentro) {
        definir(r.cidade.slug)
        setGpsEstado({ tom: 'ok', texto: `Você está perto de ${r.cidade.nome} · a ~${dist}` })
      } else {
        definir('')
        setGpsEstado({
          tom: 'aviso',
          texto: `Ainda não temos eventos na sua região. A cidade mais próxima é ${r.cidade.nome}, a ~${dist} — os eventos aparecem do mais perto para o mais longe.`,
        })
      }
    } catch (err) {
      const texto =
        err.codigo === 'permissao'
          ? 'Permissão negada. Toque no ícone de cadeado ao lado do endereço e ative a localização.'
          : err.message || 'Não deu para usar a localização.'
      setGpsEstado({ tom: 'erro', texto })
    }
  }

  function limparGps() {
    definirCoords(null)
    setGpsEstado(null)
  }

  return (
    <div className={`relative ${classe}`} ref={caixaRef}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-semibold text-creme/90 transition-colors hover:text-destaque"
        aria-haspopup="dialog"
        aria-expanded={aberto}
      >
        <span className={coords ? 'text-destaque' : ''}>
          <IconePin />
        </span>
        <span className="max-w-[8rem] truncate sm:max-w-[9rem]">{rotulo}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-label="Escolher cidade"
          className="animar-popover absolute left-0 z-50 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-xl bg-superficie p-3 text-texto shadow-xl ring-1 ring-borda/15"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={usarGps}
              disabled={gpsEstado === 'buscando' || negada}
              className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold text-texto hover:bg-texto/5 disabled:opacity-60"
            >
              {gpsEstado === 'buscando' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="girando">
                  <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <span className="text-destaque">
                  <IconeAlvo />
                </span>
              )}
              {gpsEstado === 'buscando'
                ? 'Localizando você…'
                : coords
                  ? 'Atualizar minha localização'
                  : 'Usar minha localização'}
            </button>
            {coords && (
              <button
                type="button"
                onClick={limparGps}
                className="rounded-lg px-2 py-2 text-xs text-suave hover:bg-texto/5"
              >
                limpar
              </button>
            )}
          </div>

          {negada && !gpsEstado && (
            <p className="mt-1 px-2 text-xs text-suave">
              A localização está bloqueada para este site. Ative no ícone de cadeado ao lado do
              endereço para ver eventos perto de você.
            </p>
          )}

          {gpsEstado && gpsEstado !== 'buscando' && (
            <p
              className={`mt-1 px-2 text-xs ${
                gpsEstado.tom === 'erro'
                  ? 'text-red-700 dark:text-red-400'
                  : gpsEstado.tom === 'aviso'
                    ? 'text-texto'
                    : 'text-suave'
              }`}
              role="status"
            >
              {gpsEstado.tom === 'ok' ? '✓ ' : ''}
              {gpsEstado.texto}
            </p>
          )}

          {coords && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-texto/5 px-2 py-1.5">
              <label htmlFor="raio-eventos" className="text-xs font-semibold text-suave">
                Mostrar eventos
              </label>
              <select
                id="raio-eventos"
                className="flex-1 rounded-md border-2 border-borda/20 bg-superficie px-2 py-1 text-xs text-texto"
                value={raioKm ?? ''}
                onChange={(e) => definirRaio(e.target.value ? Number(e.target.value) : null)}
              >
                {RAIOS.map((r) => (
                  <option key={r.rotulo} value={r.km ?? ''}>
                    {r.rotulo}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label htmlFor="busca-cidade" className="sr-only">
            Buscar cidade
          </label>
          <input
            id="busca-cidade"
            type="search"
            className="campo mt-2 !py-2 text-sm"
            placeholder="Buscar cidade…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <ul className="mt-2 max-h-64 overflow-y-auto">
            <li>
              <button
                type="button"
                onClick={() => escolher('')}
                className={`w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-texto/5 ${
                  !slug ? 'font-bold text-destaque' : ''
                }`}
              >
                Todas as cidades
              </button>
            </li>
            {lista.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => escolher(c.slug)}
                  className={`w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-texto/5 ${
                    c.slug === slug ? 'font-bold text-destaque' : ''
                  }`}
                >
                  {c.nome} <span className="text-suave">/{c.uf}</span>
                </button>
              </li>
            ))}
            {lista.length === 0 && (
              <li className="px-2 py-2 text-sm text-suave">Nenhuma cidade encontrada.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
