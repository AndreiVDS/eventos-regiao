import { CATEGORIAS, rotuloCategoria } from './formatacao'

/** Agrupa uma lista por uma chave e conta. Retorna [{ rotulo, valor, chave }]. */
function contarPor(lista, chave, rotulador = (v) => v) {
  const mapa = new Map()
  for (const item of lista) {
    const k = chave(item)
    if (k == null || k === '') continue
    mapa.set(k, (mapa.get(k) || 0) + 1)
  }
  return [...mapa.entries()]
    .map(([k, valor]) => ({ chave: k, rotulo: rotulador(k), valor }))
    .sort((a, b) => b.valor - a.valor)
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/**
 * Calcula o painel de métricas a partir de TODOS os eventos.
 * Os KPIs de fila (pendentes/recusados) usam todos os status; os
 * gráficos de distribuição refletem só o que está publicado.
 */
export function calcularMetricas(eventos) {
  const aprovados = eventos.filter((e) => e.status === 'aprovado')
  const pendentes = eventos.filter((e) => e.status === 'pendente')
  const base = aprovados

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const em30 = new Date(hoje)
  em30.setDate(em30.getDate() + 30)

  const proximos30 = aprovados.filter((e) => {
    const ini = new Date(e.data_inicio)
    const fim = new Date(e.data_fim || e.data_inicio)
    return fim >= hoje && ini <= em30
  })

  const gratuitos = aprovados.filter((e) => e.entrada === 'gratuito').length
  const pctGratuitos = aprovados.length ? Math.round((gratuitos / aprovados.length) * 100) : 0

  // eventos por mês nos próximos 12 meses (a partir do mês atual)
  const porMes = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
    const ini = d
    const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const valor = aprovados.filter((e) => {
      const eIni = new Date(e.data_inicio)
      const eFim = new Date(e.data_fim || e.data_inicio)
      return eIni <= fim && eFim >= ini
    }).length
    porMes.push({
      chave: `${d.getFullYear()}-${d.getMonth() + 1}`,
      rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      valor,
    })
  }

  const porCategoriaMapa = contarPor(base, (e) => e.categoria, rotuloCategoria)
  // garante todas as categorias no gráfico, mesmo com zero
  const porCategoria = CATEGORIAS.map((c) => ({
    chave: c.valor,
    rotulo: c.rotulo,
    valor: porCategoriaMapa.find((x) => x.chave === c.valor)?.valor || 0,
  })).sort((a, b) => b.valor - a.valor)

  return {
    total: aprovados.length,
    pendentes: pendentes.length,
    recusados: eventos.filter((e) => e.status === 'recusado').length,
    cidadesAtivas: new Set(aprovados.map((e) => e.cidade)).size,
    estadosAtivos: new Set(aprovados.map((e) => e.uf)).size,
    proximos30: proximos30.length,
    pctGratuitos,
    porCidade: contarPor(base, (e) => e.cidade_nome).slice(0, 10),
    porCategoria,
    porUf: contarPor(base, (e) => e.uf),
    porMes,
  }
}
