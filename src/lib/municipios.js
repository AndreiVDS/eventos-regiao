/**
 * Lista de municípios do Brasil (fonte: IBGE), embutida no app em
 * public/dados/municipios.json — sem depender de API em tempo real.
 * Gerada por scripts/gerar-municipios.mjs.
 */

export const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR',
  'PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

let cache = null
async function carregar() {
  if (cache) return cache
  const r = await fetch('/dados/municipios.json')
  if (!r.ok) throw new Error('Não foi possível carregar a lista de municípios.')
  cache = await r.json()
  return cache
}

/** Nomes dos municípios de um estado, em ordem alfabética. `[]` se a UF for inválida. */
export async function municipiosDoEstado(uf) {
  if (!uf) return []
  const mapa = await carregar()
  return mapa[uf.toUpperCase()] || []
}
