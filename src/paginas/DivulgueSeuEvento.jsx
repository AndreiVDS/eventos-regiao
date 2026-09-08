import { useState } from 'react'
import { Link } from 'react-router-dom'
import { enviarEvento, listarCidades } from '../lib/api'
import { supabaseConfigurado } from '../lib/supabase'
import { useAsync } from '../lib/useAsync'
import { CATEGORIAS, ENTRADAS } from '../lib/formatacao'

const INICIAL = {
  titulo: '',
  descricao: '',
  categoria: '',
  cidade: '',
  local: '',
  endereco: '',
  data_inicio: '',
  data_fim: '',
  horario: '',
  entrada: '',
  preco_texto: '',
  link_oficial: '',
  imagem_url: '',
  organizador_nome: '',
  organizador_contato: '',
  aceite: false,
}

export default function DivulgueSeuEvento() {
  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const [form, setForm] = useState(INICIAL)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function campo(nome, valor) {
    setForm((f) => ({ ...f, [nome]: valor }))
  }

  function validar() {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'Informe o nome do evento.'
    if (form.descricao.trim().length < 20)
      e.descricao = 'Descreva o evento com pelo menos 20 caracteres.'
    if (!form.categoria) e.categoria = 'Escolha uma categoria.'
    if (!form.cidade) e.cidade = 'Escolha a cidade.'
    if (!form.local.trim()) e.local = 'Informe o local.'
    if (!form.data_inicio) e.data_inicio = 'Informe a data de início.'
    if (form.data_fim && form.data_fim < form.data_inicio)
      e.data_fim = 'A data final não pode ser antes do início.'
    if (!form.entrada) e.entrada = 'Selecione o tipo de entrada.'
    if (!form.organizador_nome.trim()) e.organizador_nome = 'Informe quem organiza.'
    if (!form.organizador_contato.trim())
      e.organizador_contato = 'Informe um e-mail ou telefone de contato.'
    if (form.link_oficial && !/^https?:\/\//i.test(form.link_oficial))
      e.link_oficial = 'O link deve começar com http:// ou https://'
    if (!form.aceite) e.aceite = 'É necessário concordar para enviar.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function enviar(ev) {
    ev.preventDefault()
    if (!validar()) {
      document.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    setEnviando(true)
    try {
      const cidadeObj = cidades?.find((c) => c.slug === form.cidade)
      await enviarEvento({
        ...form,
        cidade_nome: cidadeObj?.nome || form.cidade,
        uf: cidadeObj?.uf || '',
        imagem_url: form.imagem_url || '/img/1122.png',
      })
      setEnviado(true)
      setForm(INICIAL)
    } catch (err) {
      setErros({ geral: 'Não foi possível enviar agora. Tente novamente em instantes.' })
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="container-pagina py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-tinta/10">
          <p className="text-5xl" aria-hidden="true">
            ✅
          </p>
          <h1 className="mt-4 text-3xl">Evento enviado!</h1>
          <p className="mt-2 text-tinta/75">
            Recebemos sua proposta. A equipe vai revisar as informações e, uma vez aprovado, o
            evento aparece na agenda pública.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-contorno" onClick={() => setEnviado(false)}>
              Enviar outro
            </button>
            <Link to="/eventos" className="btn-destaque">
              Ver a agenda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const inval = (nome) => (erros[nome] ? 'true' : undefined)

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Divulgue seu evento</h1>
      <p className="mt-1 max-w-2xl text-tinta/70">
        Grandes ou pequenos, todos os eventos que fortalecem a cultura e a economia local podem ser
        cadastrados aqui. O envio é gratuito e passa por uma revisão antes de ser publicado.
      </p>

      {!supabaseConfigurado && (
        <p className="mt-4 rounded-lg bg-destaque/20 p-3 text-sm text-tinta">
          <strong>Modo demonstração:</strong> o banco de dados ainda não está conectado, então o
          envio fica salvo apenas neste navegador. Configure o Supabase (veja o README) para receber
          os envios de verdade.
        </p>
      )}

      {erros.geral && (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800" role="alert">
          {erros.geral}
        </p>
      )}

      <form onSubmit={enviar} noValidate className="mt-8 grid gap-6 lg:grid-cols-2">
        <Grupo className="lg:col-span-2" rotulo="Nome do evento" htmlFor="titulo" erro={erros.titulo}>
          <input
            id="titulo"
            className="campo"
            value={form.titulo}
            onChange={(e) => campo('titulo', e.target.value)}
            aria-invalid={inval('titulo')}
            aria-describedby={erros.titulo ? 'err-titulo' : undefined}
          />
        </Grupo>

        <Grupo
          className="lg:col-span-2"
          rotulo="Descrição"
          htmlFor="descricao"
          erro={erros.descricao}
          dica="Conte o que acontece, para quem é e por que vale a pena participar."
        >
          <textarea
            id="descricao"
            rows="4"
            className="campo"
            value={form.descricao}
            onChange={(e) => campo('descricao', e.target.value)}
            aria-invalid={inval('descricao')}
            aria-describedby={erros.descricao ? 'err-descricao' : undefined}
          />
        </Grupo>

        <Grupo rotulo="Categoria" htmlFor="categoria" erro={erros.categoria}>
          <select
            id="categoria"
            className="campo"
            value={form.categoria}
            onChange={(e) => campo('categoria', e.target.value)}
            aria-invalid={inval('categoria')}
          >
            <option value="">Selecione…</option>
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </Grupo>

        <Grupo rotulo="Cidade" htmlFor="cidade" erro={erros.cidade}>
          <select
            id="cidade"
            className="campo"
            value={form.cidade}
            onChange={(e) => campo('cidade', e.target.value)}
            aria-invalid={inval('cidade')}
          >
            <option value="">Selecione…</option>
            {(cidades || []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}/{c.uf}
              </option>
            ))}
          </select>
        </Grupo>

        <Grupo rotulo="Local (nome do espaço)" htmlFor="local" erro={erros.local}>
          <input
            id="local"
            className="campo"
            value={form.local}
            onChange={(e) => campo('local', e.target.value)}
            aria-invalid={inval('local')}
          />
        </Grupo>

        <Grupo rotulo="Endereço" htmlFor="endereco">
          <input
            id="endereco"
            className="campo"
            value={form.endereco}
            onChange={(e) => campo('endereco', e.target.value)}
          />
        </Grupo>

        <Grupo rotulo="Data de início" htmlFor="data_inicio" erro={erros.data_inicio}>
          <input
            id="data_inicio"
            type="date"
            className="campo"
            value={form.data_inicio}
            onChange={(e) => campo('data_inicio', e.target.value)}
            aria-invalid={inval('data_inicio')}
          />
        </Grupo>

        <Grupo rotulo="Data de término (opcional)" htmlFor="data_fim" erro={erros.data_fim}>
          <input
            id="data_fim"
            type="date"
            className="campo"
            value={form.data_fim}
            onChange={(e) => campo('data_fim', e.target.value)}
            aria-invalid={inval('data_fim')}
          />
        </Grupo>

        <Grupo rotulo="Horário" htmlFor="horario" dica="Ex.: a partir das 18h">
          <input
            id="horario"
            className="campo"
            value={form.horario}
            onChange={(e) => campo('horario', e.target.value)}
          />
        </Grupo>

        <Grupo rotulo="Entrada" htmlFor="entrada" erro={erros.entrada}>
          <select
            id="entrada"
            className="campo"
            value={form.entrada}
            onChange={(e) => campo('entrada', e.target.value)}
            aria-invalid={inval('entrada')}
          >
            <option value="">Selecione…</option>
            {ENTRADAS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.rotulo}
              </option>
            ))}
          </select>
        </Grupo>

        <Grupo rotulo="Detalhe de preço (opcional)" htmlFor="preco_texto" dica="Ex.: R$ 20; grátis até as 18h">
          <input
            id="preco_texto"
            className="campo"
            value={form.preco_texto}
            onChange={(e) => campo('preco_texto', e.target.value)}
          />
        </Grupo>

        <Grupo rotulo="Link oficial (opcional)" htmlFor="link_oficial" erro={erros.link_oficial}>
          <input
            id="link_oficial"
            type="url"
            className="campo"
            placeholder="https://"
            value={form.link_oficial}
            onChange={(e) => campo('link_oficial', e.target.value)}
            aria-invalid={inval('link_oficial')}
          />
        </Grupo>

        <Grupo rotulo="URL da imagem (opcional)" htmlFor="imagem_url">
          <input
            id="imagem_url"
            type="url"
            className="campo"
            placeholder="https://"
            value={form.imagem_url}
            onChange={(e) => campo('imagem_url', e.target.value)}
          />
        </Grupo>

        <Grupo rotulo="Quem organiza" htmlFor="organizador_nome" erro={erros.organizador_nome}>
          <input
            id="organizador_nome"
            className="campo"
            value={form.organizador_nome}
            onChange={(e) => campo('organizador_nome', e.target.value)}
            aria-invalid={inval('organizador_nome')}
          />
        </Grupo>

        <Grupo
          rotulo="Contato (e-mail ou telefone)"
          htmlFor="organizador_contato"
          erro={erros.organizador_contato}
          dica="Usado só pela equipe para tirar dúvidas. Não aparece no site."
        >
          <input
            id="organizador_contato"
            className="campo"
            value={form.organizador_contato}
            onChange={(e) => campo('organizador_contato', e.target.value)}
            aria-invalid={inval('organizador_contato')}
          />
        </Grupo>

        <div className="lg:col-span-2">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5"
              checked={form.aceite}
              onChange={(e) => campo('aceite', e.target.checked)}
              aria-invalid={inval('aceite')}
            />
            <span>
              Confirmo que as informações são verdadeiras e autorizo a divulgação do evento na
              plataforma. Os dados de contato serão usados apenas pela equipe organizadora
              (conforme a LGPD).
            </span>
          </label>
          {erros.aceite && (
            <p className="mt-1 text-sm text-red-700" role="alert">
              {erros.aceite}
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <button type="submit" className="btn-destaque" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar para revisão'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Grupo({ rotulo, htmlFor, erro, dica, children, className = '' }) {
  return (
    <div className={className}>
      <label className="rotulo" htmlFor={htmlFor}>
        {rotulo}
      </label>
      {dica && (
        <p id={`dica-${htmlFor}`} className="mb-1 text-xs text-tinta/60">
          {dica}
        </p>
      )}
      {children}
      {erro && (
        <p id={`err-${htmlFor}`} className="mt-1 text-sm text-red-700" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}
