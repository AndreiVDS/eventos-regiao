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

export function cidadeMaisProxima(ponto, cidades) {
  let melhor = null
  let menor = Infinity
  for (const c of cidades) {
    if (c.lat == null || c.lng == null) continue
    const d = haversineKm(ponto, { lat: c.lat, lng: c.lng })
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
