/** Utilidades geográficas puras (sem React). */

export function haversineKm(a, b) {
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

/** Coordenada de uma cidade (do registro ou do mapa de referência). */
export function coordsDaCidade(c) {
  if (!c) return null
  if (c.lat != null && c.lng != null) return { lat: c.lat, lng: c.lng }
  const ref = COORDENADAS[c.slug]
  return ref ? { lat: ref[0], lng: ref[1] } : null
}

export function distanciaAteCidade(origem, cidade) {
  const co = coordsDaCidade(cidade)
  if (!origem || !co) return null
  return haversineKm(origem, co)
}

export function distanciaAteSlug(origem, slug) {
  const ref = COORDENADAS[slug]
  if (!origem || !ref) return null
  return haversineKm(origem, { lat: ref[0], lng: ref[1] })
}

export function formatarDistancia(km) {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km)} km`
}

// Até esta distância consideramos que a pessoa "é" daquela cidade e a
// selecionamos automaticamente. Além disso, mantemos "Todas as cidades" e só
// ordenamos os eventos pela distância.
export const RAIO_COBERTURA_KM = 120

export function dentroDaCobertura(distanciaKm) {
  return distanciaKm != null && distanciaKm <= RAIO_COBERTURA_KM
}

export function cidadeMaisProxima(ponto, cidades) {
  let melhor = null
  let menor = Infinity
  for (const c of cidades) {
    const d = distanciaAteCidade(ponto, c)
    if (d == null) continue
    if (d < menor) {
      menor = d
      melhor = c
    }
  }
  return melhor ? { cidade: melhor, distanciaKm: Math.round(menor) } : null
}
