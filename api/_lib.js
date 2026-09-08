// Utilidades compartilhadas pelas funções serverless da API pública.
import snapshot from './_dados.json' with { type: 'json' }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

/** CORS liberado (a API é de leitura pública) + cache na borda da Vercel. */
export function cabecalhos(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
}

export function normalizar(t = '') {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
}

/** Busca os dados no Supabase (se configurado) ou no snapshot local. */
export async function carregar() {
  if (SUPABASE_URL && SUPABASE_KEY) {
    const base = `${SUPABASE_URL}/rest/v1`
    const opts = { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    const [eventos, cidades] = await Promise.all([
      fetch(`${base}/eventos?status=eq.aprovado&select=*&order=data_inicio.asc`, opts).then((r) => r.json()),
      fetch(`${base}/cidades?select=*&order=nome.asc`, opts).then((r) => r.json()),
    ])
    return { eventos, cidades }
  }
  return snapshot
}
