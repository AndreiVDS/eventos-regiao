import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * "Cidade atual" — preferência global de localização do visitante.
 * Guardada no localStorage; '' significa "todas as cidades".
 * Também guarda (opcional) a posição aproximada do "perto de mim".
 */

const CHAVE = 'cidade'
const CHAVE_LOC = 'localizacao' // { lat, lng, em } — coords arredondadas + validade
const TTL_MS = 12 * 60 * 60 * 1000

const CidadeContexto = createContext(null)
const LocalContexto = createContext(null)

function lerSlug() {
  try {
    return localStorage.getItem(CHAVE) || ''
  } catch {
    return ''
  }
}

function lerLoc() {
  try {
    const o = JSON.parse(localStorage.getItem(CHAVE_LOC) || 'null')
    if (o && Date.now() - o.em < TTL_MS) return { lat: o.lat, lng: o.lng }
  } catch {
    /* ignore */
  }
  return null
}

export function CidadeProvider({ children }) {
  const [slug, setSlug] = useState(lerSlug)
  const [coords, setCoords] = useState(lerLoc)

  const definir = useCallback((novo) => {
    setSlug(novo || '')
    try {
      if (novo) localStorage.setItem(CHAVE, novo)
      else localStorage.removeItem(CHAVE)
    } catch {
      // sem localStorage — vale só nesta sessão
    }
  }, [])

  const definirCoords = useCallback((c) => {
    if (!c) {
      setCoords(null)
      try {
        localStorage.removeItem(CHAVE_LOC)
      } catch {
        /* ignore */
      }
      return
    }
    // arredonda para ~1 km (2 casas) — não guardamos a posição exata
    const lat = Math.round(c.lat * 100) / 100
    const lng = Math.round(c.lng * 100) / 100
    setCoords({ lat, lng })
    try {
      localStorage.setItem(CHAVE_LOC, JSON.stringify({ lat, lng, em: Date.now() }))
    } catch {
      /* ignore */
    }
  }, [])

  // sincroniza entre abas
  useEffect(() => {
    const aoMudar = (e) => {
      if (e.key === CHAVE) setSlug(e.newValue || '')
      if (e.key === CHAVE_LOC) setCoords(lerLoc())
    }
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [])

  const valorLoc = useMemo(() => ({ coords, definirCoords }), [coords, definirCoords])

  return createElement(
    CidadeContexto.Provider,
    { value: [slug, definir] },
    createElement(LocalContexto.Provider, { value: valorLoc }, children),
  )
}

export function useCidadeAtual() {
  const ctx = useContext(CidadeContexto)
  if (!ctx) throw new Error('useCidadeAtual deve estar dentro de <CidadeProvider>')
  return ctx
}

export function useLocalizacao() {
  const ctx = useContext(LocalContexto)
  if (!ctx) throw new Error('useLocalizacao deve estar dentro de <CidadeProvider>')
  return ctx
}

/* ---------- geolocalização ---------- */

export {
  COORDENADAS,
  RAIO_COBERTURA_KM,
  dentroDaCobertura,
  coordsDaCidade,
  distanciaAteCidade,
  distanciaAteSlug,
  formatarDistancia,
  cidadeMaisProxima,
} from './geo'

/** Pede a localização do navegador. Resolve com { lat, lng } ou rejeita. */
export function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocalização não suportada neste navegador.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Não foi possível obter sua localização.')),
      { timeout: 8000, maximumAge: 300000 },
    )
  })
}
