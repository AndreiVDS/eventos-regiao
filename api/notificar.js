// POST /api/notificar — envia e-mail ao organizador quando a equipe aprova ou
// recusa um evento. Só a equipe (autenticada) pode disparar.
//
// Variáveis de ambiente na Vercel:
//   GMAIL_USER            e-mail completo (ex.: equipe@gmail.com)
//   GMAIL_APP_PASSWORD    senha de app de 16 caracteres do Gmail
//   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (já existem)
import nodemailer from 'nodemailer'

const SUPA_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPA_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const SITE = (process.env.VITE_SITE_URL || 'https://eventos-regiao.vercel.app').replace(/\/$/, '')
const ehEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || '').trim())

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' })
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(200).json({ enviado: false, motivo: 'SMTP não configurado' })
  }

  try {
    const { access_token, evento_id, status, motivo } = req.body || {}
    if (!access_token || !evento_id || !['aprovado', 'recusado'].includes(status)) {
      return res.status(400).json({ erro: 'Parâmetros inválidos' })
    }

    const auth = { apikey: SUPA_KEY, Authorization: `Bearer ${access_token}` }

    // 1. quem chamou faz parte da equipe? (a RLS só devolve a própria linha)
    const equipe = await fetch(`${SUPA_URL}/rest/v1/equipe?select=email&limit=1`, {
      headers: auth,
    }).then((r) => r.json())
    if (!Array.isArray(equipe) || equipe.length === 0) {
      return res.status(403).json({ erro: 'Apenas a equipe pode notificar' })
    }

    // 2. dados do evento (a RLS da equipe permite ler tudo)
    const [evento] = await fetch(
      `${SUPA_URL}/rest/v1/eventos?id=eq.${encodeURIComponent(evento_id)}` +
        `&select=titulo,organizador_nome,organizador_contato`,
      { headers: auth },
    ).then((r) => r.json())
    if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' })

    const para = evento.organizador_contato
    if (!ehEmail(para)) {
      return res.status(200).json({ enviado: false, motivo: 'contato do organizador não é e-mail' })
    }

    // 3. monta e envia
    const aprovado = status === 'aprovado'
    const assunto = aprovado
      ? `Seu evento foi publicado: ${evento.titulo}`
      : `Sobre o seu evento: ${evento.titulo}`
    const corpo = aprovado
      ? `Olá!\n\nO evento "${evento.titulo}" foi aprovado pela equipe e já está no ar em ${SITE}.\n\n` +
        `Acompanhe as confirmações de presença em ${SITE}/organizador.\n\n— Equipe Eventos Região`
      : `Olá!\n\nO evento "${evento.titulo}" não foi aprovado desta vez.\n` +
        (motivo ? `\nMotivo: ${motivo}\n` : '') +
        `\nVocê pode ajustar as informações e enviar de novo em ${SITE}/organizador.\n\n— Equipe Eventos Região`

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
    await transporter.sendMail({
      from: `Eventos Região <${process.env.GMAIL_USER}>`,
      to: para,
      subject: assunto,
      text: corpo,
    })

    return res.status(200).json({ enviado: true })
  } catch (err) {
    return res.status(500).json({ erro: 'Falha ao enviar', detalhe: String(err?.message || err) })
  }
}
