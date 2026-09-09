/** Helpers de agenda: "neste fim de semana" e "eventos relacionados". */

/** Converte "YYYY-MM-DD" numa Date no fuso local (evita o pulo de dia do UTC). */
export function dataLocal(valor) {
  if (valor instanceof Date) {
    const d = new Date(valor)
    d.setHours(0, 0, 0, 0)
    return d
  }
  const [a, m, dia] = String(valor).slice(0, 10).split('-').map(Number)
  return new Date(a, (m || 1) - 1, dia || 1)
}

function fimDoDia(valor) {
  const d = dataLocal(valor)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Sábado e domingo do fim de semana mais próximo.
 * Se hoje já for sábado ou domingo, considera o fim de semana atual.
 */
export function proximoFimDeSemana(base = new Date()) {
  const hoje = dataLocal(base)
  const dow = hoje.getDay() // 0 = domingo ... 6 = sábado
  const sabado = new Date(hoje)
  if (dow === 0) sabado.setDate(hoje.getDate() - 1)
  else if (dow !== 6) sabado.setDate(hoje.getDate() + (6 - dow))
  const domingo = new Date(sabado)
  domingo.setDate(sabado.getDate() + 1)
  domingo.setHours(23, 59, 59, 999)
  return { inicio: sabado, fim: domingo }
}

/** O período [data_inicio, data_fim] do evento cruza [inicio, fim]? */
export function eventoNoIntervalo(evento, inicio, fim) {
  const eIni = dataLocal(evento.data_inicio)
  const eFim = fimDoDia(evento.data_fim || evento.data_inicio)
  return eIni <= fim && eFim >= inicio
}

export function eventosDoFimDeSemana(eventos = [], base = new Date()) {
  const { inicio, fim } = proximoFimDeSemana(base)
  return eventos
    .filter((e) => e.status === 'aprovado' && eventoNoIntervalo(e, inicio, fim))
    .sort((a, b) => dataLocal(a.data_inicio) - dataLocal(b.data_inicio))
}

/**
 * Ordena outros eventos por relevância em relação a um evento:
 * mesma cidade primeiro, depois mesma categoria, depois o resto.
 * Exclui o próprio e eventos já encerrados.
 */
export function eventosRelacionados(evento, todos = [], limite = 3) {
  if (!evento) return []
  const hoje = dataLocal(new Date())
  const pontos = (e) =>
    (e.cidade === evento.cidade ? 2 : 0) + (e.categoria === evento.categoria ? 1 : 0)
  return todos
    .filter((e) => e.id !== evento.id && e.status === 'aprovado')
    .filter((e) => fimDoDia(e.data_fim || e.data_inicio) >= hoje)
    .filter((e) => pontos(e) > 0)
    .sort((a, b) => pontos(b) - pontos(a) || dataLocal(a.data_inicio) - dataLocal(b.data_inicio))
    .slice(0, limite)
}
