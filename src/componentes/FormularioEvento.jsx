import { useState } from 'react'
import { listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { CATEGORIAS, ENTRADAS } from '../lib/formatacao'

export const EVENTO_VAZIO = {
  titulo: '',
  descricao: '',
  descricao_completa: '',
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

export default function FormularioEvento({ valorInicial = EVENTO_VAZIO, aoEnviar, textoBotao = 'Enviar para revisão' }) {
  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const [form, setForm] = useState(valorInicial)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  const campo = (nome, valor) => setForm((f) => ({ ...f, [nome]: valor }))
  const inval = (nome) => (erros[nome] ? 'true' : undefined)

  function validar() {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'Informe o nome do evento.'
    if (form.descricao.trim().length < 20) e.descricao = 'Descreva com pelo menos 20 caracteres.'
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
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    setEnviando(true)
    try {
      const cidadeObj = cidades?.find((c) => c.slug === form.cidade)
      await aoEnviar({
        ...form,
        cidade_nome: cidadeObj?.nome || form.cidade,
        uf: cidadeObj?.uf || '',
        imagem_url: form.imagem_url || '/img/eventos/_padrao.svg',
      })
    } catch (err) {
      console.error(err)
      const detalhe = err?.message || err?.error_description || err?.hint
      setErros({
        geral: detalhe
          ? `Não foi possível enviar: ${detalhe}`
          : 'Não foi possível enviar agora. Tente novamente em instantes.',
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="grid gap-6 lg:grid-cols-2">
      {erros.geral && (
        <p className="lg:col-span-2 rounded-lg bg-red-100 p-3 text-sm text-red-800" role="alert">
          {erros.geral}
        </p>
      )}

      <Grupo className="lg:col-span-2" rotulo="Nome do evento" htmlFor="titulo" erro={erros.titulo}>
        <input id="titulo" className="campo" value={form.titulo}
          onChange={(e) => campo('titulo', e.target.value)} aria-invalid={inval('titulo')} />
      </Grupo>

      <Grupo className="lg:col-span-2" rotulo="Resumo" htmlFor="descricao" erro={erros.descricao}
        dica="Frase curta que aparece na listagem (o que é, para quem, por que ir).">
        <textarea id="descricao" rows="3" className="campo" value={form.descricao}
          onChange={(e) => campo('descricao', e.target.value)} aria-invalid={inval('descricao')} />
      </Grupo>

      <Grupo className="lg:col-span-2" rotulo="Descrição completa (opcional)" htmlFor="descricao_completa"
        dica="Texto exibido na página do evento.">
        <textarea id="descricao_completa" rows="5" className="campo" value={form.descricao_completa}
          onChange={(e) => campo('descricao_completa', e.target.value)} />
      </Grupo>

      <Grupo rotulo="Categoria" htmlFor="categoria" erro={erros.categoria}>
        <select id="categoria" className="campo" value={form.categoria}
          onChange={(e) => campo('categoria', e.target.value)} aria-invalid={inval('categoria')}>
          <option value="">Selecione…</option>
          {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
        </select>
      </Grupo>

      <Grupo rotulo="Cidade" htmlFor="cidade" erro={erros.cidade}>
        <select id="cidade" className="campo" value={form.cidade}
          onChange={(e) => campo('cidade', e.target.value)} aria-invalid={inval('cidade')}>
          <option value="">Selecione…</option>
          {(cidades || []).map((c) => <option key={c.slug} value={c.slug}>{c.nome}/{c.uf}</option>)}
        </select>
      </Grupo>

      <Grupo rotulo="Local (nome do espaço)" htmlFor="local" erro={erros.local}>
        <input id="local" className="campo" value={form.local}
          onChange={(e) => campo('local', e.target.value)} aria-invalid={inval('local')} />
      </Grupo>

      <Grupo rotulo="Endereço" htmlFor="endereco">
        <input id="endereco" className="campo" value={form.endereco}
          onChange={(e) => campo('endereco', e.target.value)} />
      </Grupo>

      <Grupo rotulo="Data de início" htmlFor="data_inicio" erro={erros.data_inicio}>
        <input id="data_inicio" type="date" className="campo" value={form.data_inicio}
          onChange={(e) => campo('data_inicio', e.target.value)} aria-invalid={inval('data_inicio')} />
      </Grupo>

      <Grupo rotulo="Data de término (opcional)" htmlFor="data_fim" erro={erros.data_fim}>
        <input id="data_fim" type="date" className="campo" value={form.data_fim}
          onChange={(e) => campo('data_fim', e.target.value)} aria-invalid={inval('data_fim')} />
      </Grupo>

      <Grupo rotulo="Horário" htmlFor="horario" dica="Ex.: a partir das 18h">
        <input id="horario" className="campo" value={form.horario}
          onChange={(e) => campo('horario', e.target.value)} />
      </Grupo>

      <Grupo rotulo="Entrada" htmlFor="entrada" erro={erros.entrada}>
        <select id="entrada" className="campo" value={form.entrada}
          onChange={(e) => campo('entrada', e.target.value)} aria-invalid={inval('entrada')}>
          <option value="">Selecione…</option>
          {ENTRADAS.map((e) => <option key={e.valor} value={e.valor}>{e.rotulo}</option>)}
        </select>
      </Grupo>

      <Grupo rotulo="Detalhe de preço (opcional)" htmlFor="preco_texto" dica="Ex.: R$ 20; grátis até as 18h">
        <input id="preco_texto" className="campo" value={form.preco_texto}
          onChange={(e) => campo('preco_texto', e.target.value)} />
      </Grupo>

      <Grupo rotulo="Link oficial (opcional)" htmlFor="link_oficial" erro={erros.link_oficial}>
        <input id="link_oficial" type="url" className="campo" placeholder="https://" value={form.link_oficial}
          onChange={(e) => campo('link_oficial', e.target.value)} aria-invalid={inval('link_oficial')} />
      </Grupo>

      <Grupo rotulo="URL da imagem (opcional)" htmlFor="imagem_url">
        <input id="imagem_url" type="url" className="campo" placeholder="https://" value={form.imagem_url}
          onChange={(e) => campo('imagem_url', e.target.value)} />
      </Grupo>

      <Grupo rotulo="Quem organiza" htmlFor="organizador_nome" erro={erros.organizador_nome}>
        <input id="organizador_nome" className="campo" value={form.organizador_nome}
          onChange={(e) => campo('organizador_nome', e.target.value)} aria-invalid={inval('organizador_nome')} />
      </Grupo>

      <Grupo rotulo="Contato (e-mail ou telefone)" htmlFor="organizador_contato" erro={erros.organizador_contato}
        dica="Usado só pela equipe para tirar dúvidas. Não aparece no site.">
        <input id="organizador_contato" className="campo" value={form.organizador_contato}
          onChange={(e) => campo('organizador_contato', e.target.value)} aria-invalid={inval('organizador_contato')} />
      </Grupo>

      <div className="lg:col-span-2">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={form.aceite}
            onChange={(e) => campo('aceite', e.target.checked)} aria-invalid={inval('aceite')} />
          <span>
            Confirmo que as informações são verdadeiras e autorizo a divulgação do evento na
            plataforma. Os dados de contato serão usados apenas pela equipe organizadora (conforme a LGPD).
          </span>
        </label>
        {erros.aceite && <p className="mt-1 text-sm text-red-700" role="alert">{erros.aceite}</p>}
      </div>

      <div className="lg:col-span-2">
        <button type="submit" className="btn-destaque" disabled={enviando}>
          {enviando ? 'Enviando…' : textoBotao}
        </button>
      </div>
    </form>
  )
}

function Grupo({ rotulo, htmlFor, erro, dica, children, className = '' }) {
  return (
    <div className={className}>
      <label className="rotulo" htmlFor={htmlFor}>{rotulo}</label>
      {dica && <p className="mb-1 text-xs text-tinta/60">{dica}</p>}
      {children}
      {erro && <p id={`err-${htmlFor}`} className="mt-1 text-sm text-red-700" role="alert">{erro}</p>}
    </div>
  )
}
