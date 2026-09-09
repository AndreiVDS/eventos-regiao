import { useState } from 'react'
import { enviarContato } from '../lib/api'
import { useMeta } from '../lib/meta'

const EMAIL_EQUIPE = 'andreivini31@gmail.com'
const VAZIO = { nome: '', email: '', assunto: '', mensagem: '' }

export default function Contato() {
  const [form, setForm] = useState(VAZIO)
  const [estado, setEstado] = useState(null) // null | 'enviando' | 'ok' | 'erro'
  const campo = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useMeta({
    titulo: 'Contato',
    descricao: 'Fale com a equipe do Eventos Região.',
    caminho: '/contato',
  })

  async function enviar(e) {
    e.preventDefault()
    setEstado('enviando')
    try {
      await enviarContato(form)
      setEstado('ok')
      setForm(VAZIO)
    } catch {
      setEstado('erro')
    }
  }

  const mailto = `mailto:${EMAIL_EQUIPE}?subject=${encodeURIComponent(
    form.assunto || 'Contato — Eventos Região',
  )}&body=${encodeURIComponent(`${form.mensagem}\n\n— ${form.nome} (${form.email})`)}`

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Contato</h1>
      <p className="mt-2 max-w-2xl text-suave">
        Organiza eventos, representa uma associação ou quer ver sua cidade na plataforma? Fale com a
        gente. Respondemos por e-mail.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
        {estado === 'ok' ? (
          <div className="rounded-xl bg-destaque/15 p-6 text-texto">
            <p className="font-semibold">Mensagem recebida!</p>
            <p className="mt-1 text-sm">A equipe responde no e-mail que você informou.</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="rotulo" htmlFor="c-nome">Nome</label>
              <input id="c-nome" className="campo" required value={form.nome}
                onChange={(e) => campo('nome', e.target.value)} />
            </div>
            <div>
              <label className="rotulo" htmlFor="c-email">E-mail</label>
              <input id="c-email" type="email" className="campo" required value={form.email}
                onChange={(e) => campo('email', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="rotulo" htmlFor="c-assunto">Assunto</label>
              <input id="c-assunto" className="campo" required value={form.assunto}
                onChange={(e) => campo('assunto', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="rotulo" htmlFor="c-msg">Mensagem</label>
              <textarea id="c-msg" rows="5" className="campo" required value={form.mensagem}
                onChange={(e) => campo('mensagem', e.target.value)} />
            </div>
            {estado === 'erro' && (
              <p className="sm:col-span-2 text-sm text-red-700 dark:text-red-400" role="alert">
                Não deu para enviar agora. Tente pelo e-mail abaixo.
              </p>
            )}
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-destaque" disabled={estado === 'enviando'}>
                {estado === 'enviando' ? 'Enviando…' : 'Enviar mensagem'}
              </button>
              <a href={mailto} className="text-sm text-suave underline">ou abrir no meu e-mail</a>
            </div>
          </form>
        )}

        <aside className="h-fit rounded-xl bg-superficie p-5 text-sm shadow-suave ring-1 ring-borda/10">
          <p className="font-semibold text-texto">Também dá para escrever direto:</p>
          <a href={`mailto:${EMAIL_EQUIPE}`} className="mt-1 block break-all underline">
            {EMAIL_EQUIPE}
          </a>
          <p className="mt-3 text-suave">
            Projeto acadêmico da Engenharia de Software — UNINTER. Sem fins lucrativos.
          </p>
        </aside>
      </div>
    </div>
  )
}
