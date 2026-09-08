// GET /api/eventos — lista de eventos aprovados, com filtros opcionais.
//
// Parâmetros (query string):
//   cidade    slug da cidade      (ex.: ?cidade=blumenau)
//   uf        sigla do estado     (ex.: ?uf=SC)
//   categoria cultura|esporte|comunitario|educacao|negocios|gastronomia
//   entrada   gratuito|pago|misto
//   busca     texto livre (título, resumo, local, cidade)
//   de / ate  intervalo de datas ISO (ex.: ?de=2026-10-01&ate=2026-12-31)
//   limite    número máximo de itens (padrão 100)
//
// Resposta: { total, itens: [...] }
import { carregar, cabecalhos, normalizar } from './_lib.js'

export default async function handler(req, res) {
  cabecalhos(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido' })

  try {
    const { eventos } = await carregar()
    const q = req.query || {}
    let itens = eventos.filter((e) => e.status === 'aprovado')

    if (q.cidade) itens = itens.filter((e) => e.cidade === q.cidade)
    if (q.uf) itens = itens.filter((e) => e.uf?.toLowerCase() === String(q.uf).toLowerCase())
    if (q.categoria) itens = itens.filter((e) => e.categoria === q.categoria)
    if (q.entrada) itens = itens.filter((e) => e.entrada === q.entrada)
    if (q.busca) {
      const alvo = normalizar(q.busca)
      itens = itens.filter((e) =>
        normalizar(`${e.titulo} ${e.descricao} ${e.cidade_nome} ${e.local}`).includes(alvo),
      )
    }
    if (q.de) itens = itens.filter((e) => (e.data_fim || e.data_inicio) >= q.de)
    if (q.ate) itens = itens.filter((e) => e.data_inicio <= q.ate)

    itens.sort((a, b) => (a.data_inicio < b.data_inicio ? -1 : 1))

    const limite = Math.min(Number(q.limite) || 100, 500)
    const recorte = itens.slice(0, limite)

    return res.status(200).json({ total: itens.length, itens: recorte })
  } catch (err) {
    return res.status(500).json({ erro: 'Falha ao carregar eventos', detalhe: String(err) })
  }
}
