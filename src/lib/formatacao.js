export const CATEGORIAS = [
  { valor: 'cultura', rotulo: 'Cultura', emoji: '🎭' },
  { valor: 'esporte', rotulo: 'Esporte', emoji: '🏃' },
  { valor: 'comunitario', rotulo: 'Comunitário', emoji: '🤝' },
  { valor: 'educacao', rotulo: 'Educação', emoji: '📚' },
  { valor: 'negocios', rotulo: 'Negócios', emoji: '💼' },
  { valor: 'gastronomia', rotulo: 'Gastronomia', emoji: '🍽️' },
]

export const ENTRADAS = [
  { valor: 'gratuito', rotulo: 'Gratuito' },
  { valor: 'pago', rotulo: 'Pago' },
  { valor: 'misto', rotulo: 'Parte gratuito' },
]

export const FORMATOS = [
  { valor: 'presencial', rotulo: 'Presencial', emoji: '📍' },
  { valor: 'online', rotulo: 'Online', emoji: '💻' },
  { valor: 'hibrido', rotulo: 'Híbrido', emoji: '🔀' },
]

export const RECORRENCIAS = [
  { valor: '', rotulo: 'Acontece uma vez' },
  { valor: 'semanal', rotulo: 'Toda semana', frase: 'Acontece toda semana' },
  { valor: 'mensal', rotulo: 'Todo mês', frase: 'Acontece todo mês' },
  { valor: 'anual', rotulo: 'Todo ano', frase: 'Acontece todo ano — esta é a edição desta agenda' },
]

export function rotuloRecorrencia(valor) {
  return RECORRENCIAS.find((r) => r.valor === valor)?.frase || ''
}

export const ORDENACOES = [
  { valor: 'data', rotulo: 'Data (mais próximos)' },
  { valor: 'perto', rotulo: 'Mais perto de você', exigeLocalizacao: true },
  { valor: 'recentes', rotulo: 'Adicionados recentemente' },
  { valor: 'nome', rotulo: 'Nome (A–Z)' },
]

export function rotuloFormato(valor) {
  return FORMATOS.find((f) => f.valor === valor)?.rotulo || valor
}
export function emojiFormato(valor) {
  return FORMATOS.find((f) => f.valor === valor)?.emoji || '📍'
}

export function rotuloCategoria(valor) {
  return CATEGORIAS.find((c) => c.valor === valor)?.rotulo || valor
}

export function emojiCategoria(valor) {
  return CATEGORIAS.find((c) => c.valor === valor)?.emoji || '📌'
}

export function rotuloEntrada(valor) {
  return ENTRADAS.find((e) => e.valor === valor)?.rotulo || valor
}

const fmtData = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const fmtDiaMes = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
})

/** Formata o período de um evento de forma legível: "12 de outubro de 2026"
 *  ou "8 a 18 de outubro de 2026" quando tem data final diferente. */
export function formatarPeriodo(inicio, fim) {
  if (!inicio) return ''
  const dInicio = new Date(inicio)
  if (!fim || fim === inicio) return fmtData.format(dInicio)

  const dFim = new Date(fim)
  const mesmoMes =
    dInicio.getUTCMonth() === dFim.getUTCMonth() && dInicio.getUTCFullYear() === dFim.getUTCFullYear()

  if (mesmoMes) {
    const diaInicio = String(dInicio.getUTCDate()).padStart(2, '0')
    return `${diaInicio} a ${fmtData.format(dFim)}`
  }
  return `${fmtDiaMes.format(dInicio)} a ${fmtData.format(dFim)}`
}

/** Retorna { dia, mes } para o "carimbo" de data nos cards. */
export function carimboData(inicio) {
  const d = new Date(inicio)
  const partes = fmtDiaMes.formatToParts(d)
  return {
    dia: partes.find((p) => p.type === 'day')?.value || '',
    mes: (partes.find((p) => p.type === 'month')?.value || '')
      .replace('.', '')
      .toUpperCase(),
  }
}

export function eventoJaPassou(evento) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return new Date(evento.data_fim || evento.data_inicio) < hoje
}
