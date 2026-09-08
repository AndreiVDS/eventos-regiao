/**
 * Geração de eventos de calendário a partir de um evento da plataforma.
 * Como a maioria dos eventos não tem horário exato (o campo `horario` é
 * texto livre), tratamos como evento de dia inteiro.
 */

function soData(iso) {
  return String(iso).slice(0, 10)
}

/** YYYYMMDD */
function compacto(iso) {
  return soData(iso).replace(/-/g, '')
}

/** Dia seguinte em YYYYMMDD (fim exclusivo, tanto no iCal quanto no Google). */
function diaSeguinteCompacto(iso) {
  const d = new Date(soData(iso) + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return compacto(d.toISOString())
}

function descricaoCal(evento) {
  const partes = [
    evento.descricao,
    evento.horario ? `Horário: ${evento.horario}` : null,
    evento.preco_texto ? `Entrada: ${evento.preco_texto}` : null,
    evento.link_oficial ? `Site oficial: ${evento.link_oficial}` : null,
  ].filter(Boolean)
  return partes.join('\n\n')
}

function localCal(evento) {
  return [evento.local, evento.endereco, `${evento.cidade_nome}/${evento.uf}`]
    .filter(Boolean)
    .join(', ')
}

/** Link "Adicionar ao Google Agenda". */
export function linkGoogleAgenda(evento) {
  const inicio = compacto(evento.data_inicio)
  const fim = diaSeguinteCompacto(evento.data_fim || evento.data_inicio)
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: evento.titulo,
    dates: `${inicio}/${fim}`,
    details: descricaoCal(evento),
    location: localCal(evento),
  })
  return `https://calendar.google.com/calendar/render?${p}`
}

function escICS(texto = '') {
  return String(texto)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Conteúdo de um arquivo .ics (Apple Calendário, Outlook, etc.). */
export function gerarICS(evento) {
  const agora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventos Regiao//PT-BR//',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${evento.id}@eventos-regiao`,
    `DTSTAMP:${agora}`,
    `DTSTART;VALUE=DATE:${compacto(evento.data_inicio)}`,
    `DTEND;VALUE=DATE:${diaSeguinteCompacto(evento.data_fim || evento.data_inicio)}`,
    `SUMMARY:${escICS(evento.titulo)}`,
    `DESCRIPTION:${escICS(descricaoCal(evento))}`,
    `LOCATION:${escICS(localCal(evento))}`,
    evento.link_oficial ? `URL:${escICS(evento.link_oficial)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

/** Dispara o download do .ics no navegador. */
export function baixarICS(evento) {
  const blob = new Blob([gerarICS(evento)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${evento.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
