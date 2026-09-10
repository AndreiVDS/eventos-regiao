// Monta os e-mails em HTML da plataforma. Compartilhado pela função /api/notificar.
// O prefixo "_" faz a Vercel NÃO expor este arquivo como uma rota.
//
// Regras de e-mail que o layout respeita (cliente de e-mail != navegador):
//   - tudo em <table>, estilos inline, sem <style> externo, sem flexbox/grid
//   - imagens só em formato raster (Gmail descarta SVG) e com URL absoluta
//   - largura travada em ~560px

const MARCA = {
  tinta: '#1f1e1f',
  destaque: '#f4b400',
  creme: '#faf9f7',
  texto: '#2b2a2b',
  suave: '#6b6a6b',
  borda: '#e6e3df',
}
const FONTE = 'Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif'

export function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Corta um texto grande (defesa contra payload abusivo vindo do cliente). */
export function limitar(s, n = 300) {
  const t = String(s == null ? '' : s).trim()
  return t.length > n ? t.slice(0, n) + '…' : t
}

export function ehEmail(s) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || '').trim())
}

const RASTER = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i

/** URL absoluta da imagem do evento, ou null se for SVG/relativa inválida. */
export function imagemEvento(evento, site) {
  const u = String(evento?.imagem_url || '').trim()
  if (!u || !RASTER.test(u)) return null
  if (u.startsWith('http')) return u
  if (u.startsWith('/')) return site + u
  return null
}

/** "12 de outubro de 2026 até 15 de outubro de 2026 · 19h" */
export function periodoEvento(evento) {
  const fmt = (d) =>
    new Date(String(d).slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  const ini = evento?.data_inicio ? fmt(evento.data_inicio) : ''
  const fim =
    evento?.data_fim && String(evento.data_fim).slice(0, 10) !== String(evento.data_inicio).slice(0, 10)
      ? fmt(evento.data_fim)
      : ''
  let txt = ini
  if (fim) txt += ` até ${fim}`
  if (evento?.horario) txt += ` · ${escapeHtml(evento.horario)}`
  return txt
}

/* ----------------------------- peças ----------------------------- */

export function layout({ preheader = '', conteudo = '', site }) {
  const dominio = String(site || '').replace(/^https?:\/\//, '')
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background:${MARCA.creme};">
<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MARCA.creme};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${MARCA.borda};border-radius:14px;overflow:hidden;font-family:${FONTE};">
<tr><td style="background:${MARCA.tinta};padding:18px 28px;">
<span style="font-size:19px;font-weight:700;letter-spacing:.14em;color:${MARCA.creme};text-transform:uppercase;">Eventos&nbsp;Região</span>
</td></tr>
<tr><td style="padding:28px;color:${MARCA.texto};font-size:15px;line-height:1.6;">
${conteudo}
</td></tr>
<tr><td style="padding:18px 28px;background:${MARCA.creme};border-top:1px solid ${MARCA.borda};color:${MARCA.suave};font-size:12px;line-height:1.5;">
Plataforma inclusiva de eventos culturais, esportivos e comunitários.<br>
Atividade Extensionista III · Engenharia de Software · UNINTER.<br>
<a href="${site}" style="color:${MARCA.suave};text-decoration:underline;">${dominio}</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

export function botao(href, texto) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr>
<td align="center" style="border-radius:10px;background:${MARCA.destaque};">
<a href="${href}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:700;color:${MARCA.tinta};text-decoration:none;font-family:${FONTE};">${escapeHtml(texto)}</a>
</td></tr></table>`
}

export function cartaoEvento(evento, site) {
  const img = imagemEvento(evento, site)
  const cidade = [evento?.cidade_nome, evento?.uf].filter(Boolean).join(' — ')
  const quando = periodoEvento(evento)
  const linha = (emoji, valor) =>
    valor ? `<tr><td style="padding:3px 0;color:${MARCA.suave};font-size:13px;">${emoji}&nbsp; ${escapeHtml(valor)}</td></tr>` : ''
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${MARCA.borda};border-radius:12px;overflow:hidden;margin:18px 0;">
${img ? `<tr><td style="font-size:0;line-height:0;"><img src="${img}" alt="" width="558" style="display:block;width:100%;max-width:100%;height:auto;border:0;"></td></tr>` : ''}
<tr><td style="padding:16px 18px;">
<div style="font-size:17px;font-weight:700;color:${MARCA.texto};margin-bottom:8px;">${escapeHtml(evento?.titulo || 'Evento')}</div>
<table role="presentation" cellpadding="0" cellspacing="0">
${linha('📍', cidade)}
${linha('🏛️', evento?.local)}
${linha('🗓️', quando)}
</table>
</td></tr>
</table>`
}

const caixaMotivo = (motivo) =>
  motivo
    ? `<div style="background:${MARCA.creme};border:1px solid ${MARCA.borda};border-radius:10px;padding:12px 14px;margin:0 0 12px;">
<strong style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:${MARCA.suave};">Motivo</strong><br>
<span style="font-size:14px;">${escapeHtml(motivo)}</span></div>`
    : ''

/* --------------------------- templates --------------------------- */

/** Para a EQUIPE: alguém enviou um evento novo. */
export function emailNovoEvento(evento, site) {
  const painel = `${site}/painel/moderacao`
  return {
    assunto: `Novo evento para moderar — ${limitar(evento?.titulo, 80)}`,
    html: layout({
      site,
      preheader: `${limitar(evento?.organizador_nome, 60) || 'Um organizador'} enviou um evento para revisão.`,
      conteudo: `<p style="margin:0 0 8px;">Um novo evento foi enviado e está <strong>aguardando revisão</strong> da equipe.</p>
${cartaoEvento(evento, site)}
<p style="margin:0;color:${MARCA.suave};font-size:13px;line-height:1.7;">
Organizador: ${escapeHtml(limitar(evento?.organizador_nome, 80) || '—')}<br>
Contato: ${escapeHtml(limitar(evento?.organizador_contato, 120) || '—')}<br>
Categoria: ${escapeHtml(limitar(evento?.categoria, 40) || '—')}
</p>
${botao(painel, 'Abrir a moderação')}`,
    }),
    texto: `Novo evento para moderar: ${limitar(evento?.titulo, 120)}
Organizador: ${limitar(evento?.organizador_nome, 80) || '—'}
Contato: ${limitar(evento?.organizador_contato, 120) || '—'}
Cidade: ${[evento?.cidade_nome, evento?.uf].filter(Boolean).join(' — ')}
Quando: ${periodoEvento(evento)}

Moderar: ${painel}`,
  }
}

/** Para o ORGANIZADOR: recebemos o seu evento (recibo). */
export function emailReciboOrganizador(evento, site) {
  return {
    assunto: `Recebemos o seu evento — ${limitar(evento?.titulo, 80)}`,
    html: layout({
      site,
      preheader: `"${limitar(evento?.titulo, 60)}" foi enviado e está em análise.`,
      conteudo: `<p style="margin:0 0 8px;">Olá${evento?.organizador_nome ? `, ${escapeHtml(limitar(evento.organizador_nome, 60))}` : ''}!</p>
<p style="margin:0 0 8px;">Recebemos o seu evento. A equipe vai revisar em breve e você receberá um novo e-mail quando ele for <strong>publicado</strong> — ou se precisarmos de algum ajuste.</p>
${cartaoEvento(evento, site)}
<p style="margin:0;color:${MARCA.suave};font-size:13px;">Se algum dado acima estiver errado, é só responder este e-mail.</p>`,
    }),
    texto: `Recebemos o seu evento "${limitar(evento?.titulo, 120)}".
A equipe vai revisar em breve e você será avisado por e-mail.

Quando: ${periodoEvento(evento)}
Local: ${limitar(evento?.local, 120) || '—'}`,
  }
}

/** Para o ORGANIZADOR: evento aprovado. */
export function emailAprovado(evento, site) {
  const url = `${site}/eventos/${encodeURIComponent(evento?.id || '')}`
  return {
    assunto: `Seu evento foi publicado — ${limitar(evento?.titulo, 80)}`,
    html: layout({
      site,
      preheader: `"${limitar(evento?.titulo, 60)}" já está no ar.`,
      conteudo: `<p style="margin:0 0 8px;">Boa notícia! O seu evento foi <strong>aprovado</strong> pela equipe e já está publicado.</p>
${cartaoEvento(evento, site)}
${botao(url, 'Ver a página do evento')}
<p style="margin:0;color:${MARCA.suave};font-size:13px;">Compartilhe o link acima nas suas redes para divulgar.</p>`,
    }),
    texto: `Seu evento "${limitar(evento?.titulo, 120)}" foi aprovado e já está no ar:
${url}`,
  }
}

/** Para o ORGANIZADOR: evento recusado (com motivo, quando houver). */
export function emailRecusado(evento, motivo, site) {
  const url = `${site}/organizador`
  return {
    assunto: `Sobre o seu evento — ${limitar(evento?.titulo, 80)}`,
    html: layout({
      site,
      preheader: `Precisamos de alguns ajustes em "${limitar(evento?.titulo, 60)}".`,
      conteudo: `<p style="margin:0 0 12px;">Revisamos o seu evento e ele ainda <strong>não pôde ser publicado</strong>.</p>
${cartaoEvento(evento, site)}
${caixaMotivo(limitar(motivo, 500))}
<p style="margin:0 0 8px;">Você pode ajustar as informações e enviar de novo — é rápido.</p>
${botao(url, 'Editar e reenviar')}`,
    }),
    texto: `Seu evento "${limitar(evento?.titulo, 120)}" ainda não pôde ser publicado.${
      motivo ? `\nMotivo: ${limitar(motivo, 500)}` : ''
    }

Ajuste e reenvie em: ${url}`,
  }
}

/** Para a EQUIPE: cópia do resultado de uma moderação. */
export function emailEquipeModerado(evento, status, motivo, site) {
  const aprovado = status === 'aprovado'
  return {
    assunto: `${aprovado ? '✅ Aprovado' : '↩️ Recusado'} — ${limitar(evento?.titulo, 80)}`,
    html: layout({
      site,
      preheader: `${limitar(evento?.titulo, 60)} foi ${aprovado ? 'aprovado' : 'recusado'}.`,
      conteudo: `<p style="margin:0 0 8px;">O evento abaixo foi <strong>${aprovado ? 'aprovado e publicado' : 'recusado'}</strong>.</p>
${cartaoEvento(evento, site)}
${!aprovado ? caixaMotivo(limitar(motivo, 500)) : ''}
<p style="margin:0;color:${MARCA.suave};font-size:13px;">Cópia automática para a equipe.</p>`,
    }),
    texto: `${aprovado ? 'Aprovado' : 'Recusado'}: ${limitar(evento?.titulo, 120)}${
      !aprovado && motivo ? `\nMotivo: ${limitar(motivo, 500)}` : ''
    }`,
  }
}

/** Para a EQUIPE: nova mensagem no formulário de contato. */
export function emailContato(msg, site) {
  return {
    assunto: `Contato pelo site — ${limitar(msg?.assunto, 80) || 'nova mensagem'}`,
    html: layout({
      site,
      preheader: `${limitar(msg?.nome, 60) || 'Alguém'} enviou uma mensagem pelo site.`,
      conteudo: `<p style="margin:0 0 12px;">Nova mensagem pelo formulário de contato.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">
<tr><td style="padding:3px 0;color:${MARCA.suave};">Nome</td><td style="padding:3px 0 3px 14px;">${escapeHtml(limitar(msg?.nome, 120) || '—')}</td></tr>
<tr><td style="padding:3px 0;color:${MARCA.suave};">E-mail</td><td style="padding:3px 0 3px 14px;">${escapeHtml(limitar(msg?.email, 160) || '—')}</td></tr>
<tr><td style="padding:3px 0;color:${MARCA.suave};">Assunto</td><td style="padding:3px 0 3px 14px;">${escapeHtml(limitar(msg?.assunto, 160) || '—')}</td></tr>
</table>
<div style="background:${MARCA.creme};border:1px solid ${MARCA.borda};border-radius:10px;padding:12px 14px;margin:12px 0 0;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(limitar(msg?.mensagem, 4000))}</div>`,
    }),
    texto: `Contato de ${limitar(msg?.nome, 120)} <${limitar(msg?.email, 160)}>
Assunto: ${limitar(msg?.assunto, 160)}

${limitar(msg?.mensagem, 4000)}`,
  }
}
