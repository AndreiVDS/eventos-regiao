// POST /api/notificar — dispara os e-mails da plataforma.
//
// tipos aceitos no corpo (JSON):
//   { tipo: 'novo',      evento: {...} }                         → avisa a EQUIPE + recibo pro organizador
//   { tipo: 'contato',   mensagem: {nome,email,assunto,mensagem} } → avisa a EQUIPE
//   { tipo: 'aprovado',  access_token, evento_id, motivo? }      → avisa o ORGANIZADOR + cópia pra EQUIPE
//   { tipo: 'recusado',  access_token, evento_id, motivo? }      → idem
// (compatível com o formato antigo { access_token, evento_id, status })
//
// 'aprovado'/'recusado' exigem token de alguém da tabela `equipe`.
// 'novo'/'contato' não exigem login (quem dispara é o visitante). O conteúdo é
// sempre escapado e truncado; no pior caso alguém força uns poucos e-mails de
// aviso à equipe — aceitável nesta escala. Se virar problema, trocar por
// verificação com a service-role key do Supabase.
//
// Variáveis de ambiente na Vercel:
//   SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS SMTP_FROM   (qualquer provedor)
//   GMAIL_USER / GMAIL_APP_PASSWORD                     (atalho p/ Gmail)
//   EQUIPE_EMAILS                                       (destinatários dos avisos à equipe,
//                                                        separados por vírgula; cai p/ VITE_ADMIN_EMAILS)
import nodemailer from 'nodemailer'
import {
  ehEmail,
  emailAprovado,
  emailContato,
  emailEquipeModerado,
  emailNovoEvento,
  emailReciboOrganizador,
  emailRecusado,
} from './_email.js'

const SUPA_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPA_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const SITE = (process.env.VITE_SITE_URL || 'https://eventos-regiao.vercel.app').replace(/\/$/, '')

const EQUIPE = (process.env.EQUIPE_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(ehEmail)

const SMTP = {
  host: process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : ''),
  port: Number(process.env.SMTP_PORT || 465),
  user: process.env.SMTP_USER || process.env.GMAIL_USER || '',
  pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '',
}
SMTP.from = process.env.SMTP_FROM || SMTP.user

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' })
  if (!SMTP.host || !SMTP.user || !SMTP.pass) {
    return res.status(200).json({ enviado: false, motivo: 'SMTP não configurado' })
  }

  try {
    const corpo = req.body || {}
    const tipo =
      corpo.tipo ||
      (corpo.status === 'aprovado' ? 'aprovado' : corpo.status === 'recusado' ? 'recusado' : null)

    const transporter = nodemailer.createTransport({
      host: SMTP.host,
      port: SMTP.port,
      secure: SMTP.port === 465,
      auth: { user: SMTP.user, pass: SMTP.pass },
    })
    const enviados = []
    async function enviar(para, msg) {
      const lista = (Array.isArray(para) ? para : [para]).filter(ehEmail)
      for (const to of lista) {
        try {
          await transporter.sendMail({
            from: `Eventos Região <${SMTP.from}>`,
            to,
            subject: msg.assunto,
            text: msg.texto,
            html: msg.html,
          })
          enviados.push(to)
        } catch (e) {
          // um endereço ruim não derruba os demais
          console.error('falha ao enviar para', to, e?.message)
        }
      }
    }

    /* -------- avisos sem login: evento novo / contato -------- */

    if (tipo === 'novo') {
      const ev = corpo.evento || {}
      if (!ev.titulo) return res.status(400).json({ erro: 'evento.titulo obrigatório' })
      await enviar(EQUIPE, emailNovoEvento(ev, SITE))
      if (ehEmail(ev.organizador_contato)) {
        await enviar(ev.organizador_contato, emailReciboOrganizador(ev, SITE))
      }
      return res.status(200).json({ enviado: enviados.length > 0, para: enviados })
    }

    if (tipo === 'contato') {
      const m = corpo.mensagem || {}
      if (!ehEmail(m.email) || !m.mensagem) {
        return res.status(400).json({ erro: 'mensagem.email e mensagem.mensagem obrigatórios' })
      }
      await enviar(EQUIPE, emailContato(m, SITE))
      return res.status(200).json({ enviado: enviados.length > 0, para: enviados })
    }

    /* -------- moderação: exige alguém da equipe -------- */

    if (tipo !== 'aprovado' && tipo !== 'recusado') {
      return res.status(400).json({ erro: 'tipo inválido' })
    }

    const { access_token, evento_id, motivo } = corpo
    if (!access_token || !evento_id) {
      return res.status(400).json({ erro: 'Parâmetros inválidos' })
    }
    const auth = { apikey: SUPA_KEY, Authorization: `Bearer ${access_token}` }

    // quem chamou faz parte da equipe? (a RLS só devolve a própria linha)
    const equipe = await fetch(`${SUPA_URL}/rest/v1/equipe?select=email&limit=1`, { headers: auth })
      .then((r) => r.json())
      .catch(() => null)
    if (!Array.isArray(equipe) || equipe.length === 0) {
      return res.status(403).json({ erro: 'Apenas a equipe pode notificar' })
    }

    // dados do evento (a RLS da equipe permite ler tudo)
    const [evento] = await fetch(
      `${SUPA_URL}/rest/v1/eventos?id=eq.${encodeURIComponent(evento_id)}` +
        `&select=id,titulo,organizador_nome,organizador_contato,cidade_nome,uf,local,data_inicio,data_fim,horario,imagem_url,categoria`,
      { headers: auth },
    ).then((r) => r.json())
    if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' })

    const aprovado = tipo === 'aprovado'
    if (ehEmail(evento.organizador_contato)) {
      await enviar(
        evento.organizador_contato,
        aprovado ? emailAprovado(evento, SITE) : emailRecusado(evento, motivo, SITE),
      )
    }
    // cópia para a equipe (sem repetir o endereço do organizador)
    const paraEquipe = EQUIPE.filter((e) => e.toLowerCase() !== String(evento.organizador_contato).toLowerCase())
    await enviar(paraEquipe, emailEquipeModerado(evento, tipo, motivo, SITE))

    return res.status(200).json({ enviado: enviados.length > 0, para: enviados })
  } catch (err) {
    return res.status(500).json({ erro: 'Falha ao enviar', detalhe: String(err?.message || err) })
  }
}
