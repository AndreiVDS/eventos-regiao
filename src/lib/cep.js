/**
 * Consulta de CEP pelo ViaCEP (viacep.com.br) — gratuito, sem chave.
 * Retorna { logradouro, bairro, cidade, uf } ou null.
 */
export async function buscarCep(cep, { timeoutMs = 6000 } = {}) {
  const limpo = String(cep).replace(/\D/g, '')
  if (limpo.length !== 8) return null

  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(`https://viacep.com.br/ws/${limpo}/json/`, { signal: ctrl.signal })
    if (!r.ok) return null
    const d = await r.json()
    if (d.erro) return null
    return {
      logradouro: d.logradouro || '',
      bairro: d.bairro || '',
      cidade: d.localidade || '',
      uf: d.uf || '',
    }
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** "12345678" ou "12345-678" -> "12345-678" */
export function formatarCep(v = '') {
  const d = String(v).replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}
