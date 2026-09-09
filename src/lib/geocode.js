/**
 * Geocodificação leve pelo navegador, usando o Nominatim (OpenStreetMap).
 *
 * Serve para descobrir a latitude/longitude do LOCAL de um evento a partir do
 * endereço digitado no formulário — assim a distância "perto de mim" é medida
 * até a rua do evento, não até o centro da cidade.
 *
 * Regras de uso do Nominatim: no máx. 1 req/s e um User-Agent/Referer válido.
 * Como a chamada parte do navegador de cada organizador (baixo volume), isso é
 * respeitado naturalmente. Se falhar, o app segue sem coordenadas e cai no
 * centro da cidade.
 */

const BASE = 'https://nominatim.openstreetmap.org/search'

/**
 * @param {{ local?: string, endereco?: string, cidade_nome?: string, uf?: string }} evento
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function geocodificarEvento(evento, { timeoutMs = 7000 } = {}) {
  const partes = [evento.local, evento.endereco, evento.cidade_nome, evento.uf, 'Brasil']
    .filter(Boolean)
    .join(', ')
  if (!partes) return null

  const url = `${BASE}?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(partes)}`
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    })
    if (!r.ok) return null
    const dados = await r.json()
    const primeiro = Array.isArray(dados) ? dados[0] : null
    if (!primeiro) return null
    const lat = Number(primeiro.lat)
    const lng = Number(primeiro.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 }
  } catch {
    return null // sem rede, bloqueado, timeout — segue sem coordenadas
  } finally {
    clearTimeout(t)
  }
}
