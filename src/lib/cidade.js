import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cidadeMaisProxima, dentroDaCobertura } from './geo'
import { reverseGeo } from './geocode'

/**
 * "Cidade atual" — preferência global de localização do visitante.
 * Guardada no localStorage; '' significa "todas as cidades".
 * Também guarda (opcional) a posição aproximada do "perto de mim" + o raio.
 */

const CHAVE = 'cidade'
const CHAVE_LOC = 'localizacao' // { lat, lng, precisao, raioKm, em }
const TTL_MS = 12 * 60 * 60 * 1000
// 3 casas decimais ≈ 110 m: preciso o bastante para ordenar eventos por
// distância, sem guardar a rua/casa exata da pessoa.
const CASAS = 1000

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
    if (o && Date.now() - o.em < TTL_MS) {
      return {
        lat: o.lat,
        lng: o.lng,
        precisao: o.precisao ?? null,
        raioKm: o.raioKm ?? null,
        bairro: o.bairro ?? null,
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function gravarLoc(loc) {
  try {
    if (!loc) localStorage.removeItem(CHAVE_LOC)
    else localStorage.setItem(CHAVE_LOC, JSON.stringify({ ...loc, em: Date.now() }))
  } catch {
    /* sem localStorage — vale só nesta sessão */
  }
}

export function CidadeProvider({ children }) {
  const [slug, setSlug] = useState(lerSlug)
  const [loc, setLoc] = useState(lerLoc) // { lat, lng, raioKm } | null

  const definir = useCallback((novo) => {
    setSlug(novo || '')
    try {
      if (novo) localStorage.setItem(CHAVE, novo)
      else localStorage.removeItem(CHAVE)
    } catch {
      // sem localStorage — vale só nesta sessão
    }
  }, [])

  const definirCoords = useCallback((c, raioKm) => {
    if (!c) {
      setLoc(null)
      gravarLoc(null)
      return
    }
    const lat = Math.round(c.lat * CASAS) / CASAS
    const lng = Math.round(c.lng * CASAS) / CASAS
    const precisao = c.precisao != null ? Math.round(c.precisao) : null
    setLoc((atual) => {
      const nova = {
        lat,
        lng,
        precisao,
        raioKm: raioKm !== undefined ? raioKm : (atual?.raioKm ?? null),
        bairro: null,
      }
      gravarLoc(nova)
      return nova
    })
    // descobre o bairro em segundo plano (não bloqueia nada)
    reverseGeo({ lat, lng })
      .then((r) => {
        if (!r?.bairro) return
        setLoc((atual) => {
          if (!atual || atual.lat !== lat || atual.lng !== lng) return atual
          const nova = { ...atual, bairro: r.bairro }
          gravarLoc(nova)
          return nova
        })
      })
      .catch(() => {})
  }, [])

  const definirRaio = useCallback((raioKm) => {
    setLoc((atual) => {
      if (!atual) return atual
      const nova = { ...atual, raioKm: raioKm ?? null }
      gravarLoc(nova)
      return nova
    })
  }, [])

  // sincroniza entre abas
  useEffect(() => {
    const aoMudar = (e) => {
      if (e.key === CHAVE) setSlug(e.newValue || '')
      if (e.key === CHAVE_LOC) setLoc(lerLoc())
    }
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [])

  const coords = useMemo(
    () => (loc ? { lat: loc.lat, lng: loc.lng } : null),
    [loc],
  )

  const valorLoc = useMemo(
    () => ({
      coords,
      precisao: loc?.precisao ?? null,
      raioKm: loc?.raioKm ?? null,
      bairro: loc?.bairro ?? null,
      definirCoords,
      definirRaio,
    }),
    [coords, loc, definirCoords, definirRaio],
  )

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
  RAIOS,
  dentroDaCobertura,
  dentroDoRaio,
  coordsDaCidade,
  coordsDoEvento,
  distanciaAteCidade,
  distanciaAteSlug,
  distanciaAteEvento,
  formatarDistancia,
  cidadeMaisProxima,
} from './geo'

/** Pede a localização do navegador. Resolve com { lat, lng, precisao } ou rejeita
 *  com uma mensagem amigável (a propriedade `.codigo` diz o motivo). */
export function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      const e = new Error('Este navegador não tem localização.')
      e.codigo = 'indisponivel'
      reject(e)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precisao: pos.coords.accuracy,
        }),
      (err) => {
        const mapa = {
          1: ['permissao', 'Permissão de localização negada.'],
          2: ['indisponivel', 'Não foi possível obter sua localização agora.'],
          3: ['tempo', 'A localização demorou demais. Tente de novo.'],
        }
        const [codigo, msg] = mapa[err.code] || ['erro', 'Não deu para usar a localização.']
        const e = new Error(msg)
        e.codigo = codigo
        reject(e)
      },
      // alta precisão: no celular usa o GPS de verdade (metros), não só o wi-fi
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    )
  })
}

/**
 * Estado da permissão de geolocalização: 'prompt' | 'concedida' | 'negada' |
 * 'indisponivel' | 'desconhecida'. Atualiza sozinho quando o usuário muda no
 * navegador (quando a Permissions API existe).
 */
export function usePermissaoGeo() {
  const [estado, setEstado] = useState(() =>
    'geolocation' in navigator ? 'desconhecida' : 'indisponivel',
  )

  useEffect(() => {
    if (!('permissions' in navigator) || !navigator.permissions?.query) return
    let status
    const sincronizar = () => {
      const m = { prompt: 'prompt', granted: 'concedida', denied: 'negada' }
      setEstado(m[status.state] || 'desconhecida')
    }
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((s) => {
        status = s
        sincronizar()
        status.addEventListener('change', sincronizar)
      })
      .catch(() => {})
    return () => status?.removeEventListener('change', sincronizar)
  }, [])

  return estado
}

/**
 * Fluxo completo do "perto de mim": pede o GPS, acha a cidade mais próxima e
 * decide se dá para selecioná-la (dentro da área de cobertura) ou não.
 * Devolve { ponto, cidade, distanciaKm, dentro }.
 * Lança o erro de `obterLocalizacao` (com `.codigo`) se o GPS falhar.
 */
export async function resolverLocalizacao(cidades = []) {
  const ponto = await obterLocalizacao()
  const perto = cidadeMaisProxima(ponto, cidades)
  if (!perto) {
    const e = new Error('Não consegui carregar as cidades. Tente de novo.')
    e.codigo = 'sem-cidades'
    throw e
  }
  return {
    ponto,
    cidade: perto.cidade,
    distanciaKm: perto.distanciaKm,
    dentro: dentroDaCobertura(perto.distanciaKm),
  }
}
