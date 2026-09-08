// GET /api/cidades — cidades participantes e a contagem de eventos aprovados.
import { carregar, cabecalhos } from './_lib.js'

export default async function handler(req, res) {
  cabecalhos(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido' })

  try {
    const { cidades, eventos } = await carregar()
    const aprovados = eventos.filter((e) => e.status === 'aprovado')
    const itens = cidades.map((c) => ({
      ...c,
      total_eventos: aprovados.filter((e) => e.cidade === c.slug).length,
    }))
    return res.status(200).json({ total: itens.length, itens })
  } catch (err) {
    return res.status(500).json({ erro: 'Falha ao carregar cidades', detalhe: String(err) })
  }
}
