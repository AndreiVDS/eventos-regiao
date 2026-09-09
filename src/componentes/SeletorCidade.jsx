import { useEffect, useMemo, useRef, useState } from 'react'
import { listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import {
  useCidadeAtual,
  useLocalizacao,
  cidadeMaisProxima,
  obterLocalizacao,
  formatarDistancia,
} from '../lib/cidade'

function normalizar(t = '') {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
}

export default function SeletorCidade({ classe = '' }) {
  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const [slug, definir] = useCidadeAtual()
  const { coords, definirCoords } = useLocalizacao()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [gpsEstado, setGpsEstado] = useState(null) // null | 'buscando' | 'ok'+texto | erro
  const caixaRef = useRef(null)

  const atual = (cidades || []).find((c) => c.slug === slug)
  const rotulo = atual ? `${atual.nome}` : 'Todas as cidades'

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
      const ponto = await obterLocalizacao()
      const perto = cidadeMaisProxima(ponto, cidades || [])
      if (!perto) throw new Error('Nenhuma cidade cadastrada por perto.')
      definirCoords(ponto)
      definir(perto.cidade.slug)
      setBusca('')
      setGpsEstado(
        `Você está a ${formatarDistancia(perto.distanciaKm)} de ${perto.cidade.nome}`,
      )
    } catch (err) {
      setGpsEstado(err.message || 'Não deu para usar a localização.')
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
        aria-haspopup="true"
        aria-expanded={aberto}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span className="max-w-[9rem] truncate">{rotulo}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-label="Escolher cidade"
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl bg-superficie p-3 text-texto shadow-xl ring-1 ring-borda/15"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={usarGps}
              disabled={gpsEstado === 'buscando'}
              className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold hover:bg-texto/5"
            >
              <span aria-hidden="true">📍</span>
              {gpsEstado === 'buscando'
                ? 'Localizando…'
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
          {gpsEstado && gpsEstado !== 'buscando' && (
            <p
              className={`mt-1 px-2 text-xs ${
                gpsEstado.startsWith('Você está')
                  ? 'text-suave'
                  : 'text-red-700 dark:text-red-400'
              }`}
              role="status"
            >
              {gpsEstado.startsWith('Você está') ? '✓ ' : ''}
              {gpsEstado}
            </p>
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
