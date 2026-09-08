// GET /api/eventos/:id — um evento aprovado pelo slug.
import { carregar, cabecalhos } from '../_lib.js'

export default async function handler(req, res) {
  cabecalhos(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido' })

  try {
    const { eventos } = await carregar()
    const evento = eventos.find((e) => e.id === req.query.id && e.status === 'aprovado')
    if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' })
    return res.status(200).json(evento)
  } catch (err) {
    return res.status(500).json({ erro: 'Falha ao carregar evento', detalhe: String(err) })
  }
}
