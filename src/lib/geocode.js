/**
 * Geocodificação leve pelo navegador, usando o Nominatim (OpenStreetMap).
 *
 * Descobre a latitude/longitude do LOCAL de um evento a partir do endereço /
 * CEP digitado no formulário — assim a distância "perto de mim" é medida até a
 * rua do evento, não até o centro da cidade.
 *
 * Regras de uso do Nominatim: no máx. 1 req/s e um Referer válido. Como a
 * chamada parte do navegador de cada organizador (baixo volume), isso é
 * respeitado. Se tudo falhar, o app segue sem coordenadas e cai no centro da
 * cidade.
 */

const BASE = 'https://nominatim.openstreetmap.org/search'

async function consultar(params, timeoutMs) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const qs = new URLSearchParams({ format: 'jsonv2', limit: '1', countrycodes: 'br', ...params })
    const r = await fetch(`${BASE}?${qs}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    })
    if (!r.ok) return null
    const dados = await r.json()
    const p = Array.isArray(dados) ? dados[0] : null
    if (!p) return null
    const lat = Number(p.lat)
    const lng = Number(p.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 }
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

const soDigitos = (s = '') => String(s).replace(/\D/g, '')

/**
 * @param {{ local?, endereco?, cep?, cidade_nome?, uf? }} evento
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function geocodificarEvento(evento, { timeoutMs = 7000 } = {}) {
  const { local, endereco, cidade_nome, uf } = evento
  const cep = soDigitos(evento.cep)
  const cidade = [cidade_nome, uf].filter(Boolean).join(', ')

  // tentativas da mais precisa para a menos precisa
  const tentativas = []
  if (endereco && cidade) tentativas.push({ q: `${endereco}, ${cidade}, Brasil` })
  if (cep.length === 8) tentativas.push({ postalcode: cep, country: 'Brazil' })
  if (endereco) tentativas.push({ q: `${endereco}, Brasil` })
  if (local && cidade) tentativas.push({ q: `${local}, ${cidade}, Brasil` })

  for (const params of tentativas) {
    const r = await consultar(params, timeoutMs)
    if (r) return r
  }
  return null
}
