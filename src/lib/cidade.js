import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react'

/**
 * "Cidade atual" — preferência global de localização do visitante.
 * Guardada no localStorage; '' significa "todas as cidades".
 */

const CHAVE = 'cidade'
const CidadeContexto = createContext(null)

function ler() {
  try {
    return localStorage.getItem(CHAVE) || ''
  } catch {
    return ''
  }
}

export function CidadeProvider({ children }) {
  const [slug, setSlug] = useState(ler)

  const definir = useCallback((novo) => {
    setSlug(novo || '')
    try {
      if (novo) localStorage.setItem(CHAVE, novo)
      else localStorage.removeItem(CHAVE)
    } catch {
      // sem localStorage — vale só nesta sessão
    }
  }, [])

  // sincroniza entre abas
  useEffect(() => {
    const aoMudar = (e) => {
      if (e.key === CHAVE) setSlug(e.newValue || '')
    }
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [])

  return createElement(CidadeContexto.Provider, { value: [slug, definir] }, children)
}

export function useCidadeAtual() {
  const ctx = useContext(CidadeContexto)
  if (!ctx) throw new Error('useCidadeAtual deve estar dentro de <CidadeProvider>')
  return ctx
}

/* ---------- geolocalização: achar a cidade mais próxima ---------- */

function haversineKm(a, b) {
  const R = 6371
  const rad = (x) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

// Coordenadas de referência das cidades. Fallback caso o banco não tenha
// as colunas lat/lng preenchidas (o "perto de mim" funciona mesmo assim).
export const COORDENADAS = {
  'jaragua-do-sul': [-26.4851, -49.0666],
  blumenau: [-26.9194, -49.0661],
  florianopolis: [-27.5949, -48.5482],
  joinville: [-26.3045, -48.8487],
  curitiba: [-25.4284, -49.2733],
  ipatinga: [-19.4683, -42.5369],
  'porto-alegre': [-30.0346, -51.2177],
  gramado: [-29.3747, -50.876],
  'rio-de-janeiro': [-22.9068, -43.1729],
  'sao-paulo': [-23.5505, -46.6333],
  paraty: [-23.2178, -44.7131],
  'campos-do-jordao': [-22.7392, -45.5915],
  salvador: [-12.9777, -38.5016],
  olinda: [-8.0089, -34.8553],
  parintins: [-2.6283, -56.7358],
  'ouro-preto': [-20.3856, -43.5035],
}

function coordsDaCidade(c) {
  if (c.lat != null && c.lng != null) return { lat: c.lat, lng: c.lng }
  const ref = COORDENADAS[c.slug]
  return ref ? { lat: ref[0], lng: ref[1] } : null
}

export function cidadeMaisProxima(ponto, cidades) {
  let melhor = null
  let menor = Infinity
  for (const c of cidades) {
    const co = coordsDaCidade(c)
    if (!co) continue
    const d = haversineKm(ponto, co)
    if (d < menor) {
      menor = d
      melhor = c
    }
  }
  return melhor ? { cidade: melhor, distanciaKm: Math.round(menor) } : null
}

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
