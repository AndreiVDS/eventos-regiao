import { useEffect, useRef, useState } from 'react'
import { listarCidades, CIDADE_NOVA } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { CATEGORIAS, ENTRADAS, FORMATOS } from '../lib/formatacao'
import { buscarCep, formatarCep } from '../lib/cep'
import { enviarImagem, validarImagem, DICA_IMAGEM } from '../lib/upload'
import { UFS, municipiosDoEstado } from '../lib/municipios'

export const EVENTO_VAZIO = {
  titulo: '',
  descricao: '',
  descricao_completa: '',
  categoria: '',
  formato: 'presencial',
  cidade: '',
  cidade_nova_nome: '',
  cidade_nova_uf: '',
  cep: '',
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
  const [cepStatus, setCepStatus] = useState(null) // null | 'buscando' | 'ok' | 'erro'
  const [imgStatus, setImgStatus] = useState(null) // null | 'enviando' | 'ok' | 'erro'
  const [imgPreview, setImgPreview] = useState(valorInicial.imagem_url || '')
  const [municipios, setMunicipios] = useState([]) // lista do IBGE do estado escolhido
  const arquivoRef = useRef(null)

  const campo = (nome, valor) => setForm((f) => ({ ...f, [nome]: valor }))
  const inval = (nome) => (erros[nome] ? 'true' : undefined)

  // ao escolher a UF na "cidade nova", carrega os municípios daquele estado
  useEffect(() => {
    let ativo = true
    if (form.cidade !== CIDADE_NOVA || !form.cidade_nova_uf) {
      setMunicipios([])
      return
    }
    municipiosDoEstado(form.cidade_nova_uf)
      .then((l) => ativo && setMunicipios(l))
      .catch(() => ativo && setMunicipios([]))
    return () => {
      ativo = false
    }
  }, [form.cidade, form.cidade_nova_uf])

  async function aoDigitarCep(v) {
    const fmt = formatarCep(v)
    campo('cep', fmt)
    if (fmt.replace(/\D/g, '').length !== 8) return
    setCepStatus('buscando')
    const r = await buscarCep(fmt)
    if (!r) {
      setCepStatus('erro')
      return
    }
    setCepStatus('ok')
    setForm((f) => ({
      ...f,
      endereco: [r.logradouro, r.bairro].filter(Boolean).join(' - ') || f.endereco,
      cidade: !f.cidade && cidades ? matchCidade(cidades, r) : f.cidade,
    }))
  }

  async function aoEscolherImagem(file) {
    if (!file) return
    const erro = validarImagem(file)
    if (erro) {
      setImgStatus('erro')
      setErros((e) => ({ ...e, imagem: erro }))
      return
    }
    setErros((e) => ({ ...e, imagem: undefined }))
    setImgStatus('enviando')
    try {
      const url = await enviarImagem(file)
      campo('imagem_url', url)
      setImgPreview(url)
      setImgStatus('ok')
    } catch (err) {
      setImgStatus('erro')
      setErros((e) => ({ ...e, imagem: err.message }))
    }
  }

  function validar() {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'Informe o nome do evento.'
    if (form.descricao.trim().length < 20) e.descricao = 'Descreva com pelo menos 20 caracteres.'
    if (!form.categoria) e.categoria = 'Escolha uma categoria.'
    if (!form.cidade) e.cidade = 'Escolha a cidade.'
    if (form.cidade === CIDADE_NOVA) {
      if (!form.cidade_nova_nome.trim()) e.cidade_nova_nome = 'Informe o nome da cidade.'
      if (!form.cidade_nova_uf) e.cidade_nova_uf = 'Escolha o estado.'
    }
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
      setErros({ geral: mensagemErro(err) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {erros.geral && (
        <p className="sm:col-span-2 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200" role="alert">
          {erros.geral}
        </p>
      )}

      <Titulo>Sobre o evento</Titulo>

      <Grupo className="sm:col-span-2" rotulo="Nome do evento" htmlFor="titulo" erro={erros.titulo}>
        <input id="titulo" className="campo" value={form.titulo}
          onChange={(e) => campo('titulo', e.target.value)} aria-invalid={inval('titulo')} />
      </Grupo>

      <Grupo className="sm:col-span-2" rotulo="Resumo" htmlFor="descricao" erro={erros.descricao}
        dica="Frase curta que aparece na listagem (o que é, para quem, por que ir).">
        <textarea id="descricao" rows="3" className="campo" value={form.descricao}
          onChange={(e) => campo('descricao', e.target.value)} aria-invalid={inval('descricao')} />
      </Grupo>

      <Grupo className="sm:col-span-2" rotulo="Descrição completa (opcional)" htmlFor="descricao_completa"
        dica="Texto exibido na página do evento.">
        <textarea id="descricao_completa" rows="5" className="campo" value={form.descricao_completa}
          onChange={(e) => campo('descricao_completa', e.target.value)} />
      </Grupo>

      <Titulo>Local, data e valores</Titulo>

      <Grupo rotulo="Categoria" htmlFor="categoria" erro={erros.categoria}>
        <select id="categoria" className="campo" value={form.categoria}
          onChange={(e) => campo('categoria', e.target.value)} aria-invalid={inval('categoria')}>
          <option value="">Selecione…</option>
          {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
        </select>
      </Grupo>

      <Grupo rotulo="Formato" htmlFor="formato">
        <select id="formato" className="campo" value={form.formato || 'presencial'}
          onChange={(e) => campo('formato', e.target.value)}>
          {FORMATOS.map((f) => <option key={f.valor} value={f.valor}>{f.rotulo}</option>)}
        </select>
      </Grupo>

      <Grupo rotulo="Cidade" htmlFor="cidade" erro={erros.cidade}>
        <select id="cidade" className="campo" value={form.cidade}
          onChange={(e) => campo('cidade', e.target.value)} aria-invalid={inval('cidade')}>
          <option value="">Selecione…</option>
          {(cidades || []).map((c) => <option key={c.slug} value={c.slug}>{c.nome}/{c.uf}</option>)}
          <option value={CIDADE_NOVA}>➕ Minha cidade não está na lista</option>
        </select>
      </Grupo>

      {form.cidade === CIDADE_NOVA && (
        <>
          <Grupo rotulo="Estado" htmlFor="cidade_nova_uf" erro={erros.cidade_nova_uf}>
            <select
              id="cidade_nova_uf"
              className="campo"
              value={form.cidade_nova_uf}
              onChange={(e) => setForm((f) => ({ ...f, cidade_nova_uf: e.target.value, cidade_nova_nome: '' }))}
              aria-invalid={inval('cidade_nova_uf')}
            >
              <option value="">Selecione…</option>
              {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Grupo>
          <Grupo rotulo="Município" htmlFor="cidade_nova_nome" erro={erros.cidade_nova_nome}
            dica={!form.cidade_nova_uf ? 'Escolha o estado primeiro.' : undefined}>
            <select
              id="cidade_nova_nome"
              className="campo"
              value={form.cidade_nova_nome}
              disabled={!form.cidade_nova_uf || municipios.length === 0}
              onChange={(e) => campo('cidade_nova_nome', e.target.value)}
              aria-invalid={inval('cidade_nova_nome')}
            >
              <option value="">
                {!form.cidade_nova_uf
                  ? '—'
                  : municipios.length === 0
                    ? 'Carregando…'
                    : `Selecione… (${municipios.length} cidades)`}
              </option>
              {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Grupo>
          <p className="sm:col-span-2 -mt-2 text-xs text-suave">
            Lista oficial do IBGE. A cidade entra no site junto com o evento, assim que a equipe aprovar.
          </p>
        </>
      )}

      <Grupo rotulo="Local (nome do espaço)" htmlFor="local" erro={erros.local}>
        <input id="local" className="campo" value={form.local}
          onChange={(e) => campo('local', e.target.value)} aria-invalid={inval('local')} />
      </Grupo>

      <Grupo
        rotulo="CEP (opcional)"
        htmlFor="cep"
        dica="Preenche o endereço e ajuda a marcar a distância certa até o evento."
      >
        <input
          id="cep"
          inputMode="numeric"
          className="campo"
          placeholder="00000-000"
          value={form.cep}
          onChange={(e) => aoDigitarCep(e.target.value)}
        />
        {cepStatus === 'buscando' && <p className="mt-1 text-xs text-suave">Buscando endereço…</p>}
        {cepStatus === 'ok' && <p className="mt-1 text-xs text-suave">✓ Endereço preenchido pelo CEP.</p>}
        {cepStatus === 'erro' && (
          <p className="mt-1 text-xs text-suave">CEP não encontrado — pode digitar o endereço à mão.</p>
        )}
      </Grupo>

      <Grupo className="sm:col-span-2" rotulo="Endereço" htmlFor="endereco"
        dica="Rua, número e bairro.">
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

      <Titulo>Imagem e contato</Titulo>

      <div className="sm:col-span-2">
        <span className="rotulo">Imagem do evento (opcional)</span>
        <p className="mb-2 text-xs text-suave">{DICA_IMAGEM}</p>
        <div className="flex flex-wrap items-center gap-3">
          {imgPreview ? (
            <img
              src={imgPreview}
              alt="Pré-visualização"
              className="h-20 w-32 rounded-lg object-cover ring-1 ring-borda/15"
            />
          ) : (
            <div className="grid h-20 w-32 place-items-center rounded-lg bg-texto/5 text-xs text-suave ring-1 ring-borda/15">
              sem imagem
            </div>
          )}
          <div className="flex flex-col gap-1">
            <input
              ref={arquivoRef}
              id="imagem-arquivo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => aoEscolherImagem(e.target.files?.[0])}
            />
            <button
              type="button"
              className="btn-contorno !py-2 text-sm"
              onClick={() => arquivoRef.current?.click()}
              disabled={imgStatus === 'enviando'}
            >
              {imgStatus === 'enviando' ? 'Enviando…' : imgPreview ? 'Trocar imagem' : 'Escolher do dispositivo'}
            </button>
            {imgPreview && (
              <button
                type="button"
                className="text-xs text-suave underline hover:text-texto"
                onClick={() => {
                  campo('imagem_url', '')
                  setImgPreview('')
                  setImgStatus(null)
                }}
              >
                remover
              </button>
            )}
          </div>
        </div>
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-suave">ou colar um link da imagem</summary>
          <input
            type="url"
            className="campo mt-2"
            placeholder="https://"
            value={/^https?:/i.test(form.imagem_url) ? form.imagem_url : ''}
            onChange={(e) => {
              campo('imagem_url', e.target.value)
              setImgPreview(e.target.value)
            }}
          />
        </details>
        {erros.imagem && <p className="mt-1 text-sm text-red-700 dark:text-red-400" role="alert">{erros.imagem}</p>}
      </div>

      <Grupo rotulo="Quem organiza" htmlFor="organizador_nome" erro={erros.organizador_nome}>
        <input id="organizador_nome" className="campo" value={form.organizador_nome}
          onChange={(e) => campo('organizador_nome', e.target.value)} aria-invalid={inval('organizador_nome')} />
      </Grupo>

      <Grupo rotulo="Contato (e-mail ou telefone)" htmlFor="organizador_contato" erro={erros.organizador_contato}
        dica="Usado só pela equipe para tirar dúvidas. Não aparece no site.">
        <input id="organizador_contato" className="campo" value={form.organizador_contato}
          onChange={(e) => campo('organizador_contato', e.target.value)} aria-invalid={inval('organizador_contato')} />
      </Grupo>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={form.aceite}
            onChange={(e) => campo('aceite', e.target.checked)} aria-invalid={inval('aceite')} />
          <span>
            Confirmo que as informações são verdadeiras e autorizo a divulgação do evento na
            plataforma. Os dados de contato serão usados apenas pela equipe organizadora (conforme a LGPD).
          </span>
        </label>
        {erros.aceite && <p className="mt-1 text-sm text-red-700 dark:text-red-400" role="alert">{erros.aceite}</p>}
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="btn-destaque w-full text-base sm:w-auto"
          disabled={enviando || imgStatus === 'enviando'}
        >
          {enviando ? 'Enviando…' : textoBotao}
        </button>
      </div>
    </form>
  )
}

/** Casa a cidade do ViaCEP com uma das cidades cadastradas (mesma UF + nome). */
function matchCidade(cidades, r) {
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const achou = cidades.find(
    (c) => c.uf?.toUpperCase() === r.uf?.toUpperCase() && norm(c.nome) === norm(r.cidade),
  )
  return achou?.slug || ''
}

/** Traduz o erro técnico do banco numa frase que o organizador entende. */
function mensagemErro(err) {
  const bruto = (err?.message || err?.error_description || err?.hint || '').toLowerCase()
  if (!bruto) return 'Não foi possível enviar agora. Tente novamente em instantes.'
  if (bruto.includes('duplicate key') || bruto.includes('already exists'))
    return 'Já existe um evento com esse nome. Mude um pouco o título e tente de novo.'
  if (bruto.includes('violates not-null') || bruto.includes('null value'))
    return 'Faltou preencher um campo obrigatório. Revise o formulário e tente de novo.'
  if (bruto.includes('violates check constraint'))
    return 'Algum valor não é aceito (categoria, formato ou tipo de entrada). Revise e tente de novo.'
  if (bruto.includes('violates foreign key'))
    return 'A cidade selecionada não está cadastrada. Escolha outra da lista.'
  if (bruto.includes('row-level security') || bruto.includes('permission'))
    return 'Você precisa estar logado para enviar um evento. Entre e tente de novo.'
  if (bruto.includes('failed to fetch') || bruto.includes('network'))
    return 'Sem conexão com o servidor. Verifique a internet e tente de novo.'
  return 'Não foi possível enviar agora. Tente novamente em instantes.'
}

function Titulo({ children }) {
  return (
    <h2 className="sm:col-span-2 mb-1 mt-4 border-b border-borda/10 pb-1 text-sm font-bold uppercase tracking-wide text-suave first:mt-0">
      {children}
    </h2>
  )
}

function Grupo({ rotulo, htmlFor, erro, dica, children, className = '' }) {
  return (
    <div className={className}>
      <label className="rotulo" htmlFor={htmlFor}>{rotulo}</label>
      {dica && <p className="mb-1 text-xs text-suave">{dica}</p>}
      {children}
      {erro && <p id={`err-${htmlFor}`} className="mt-1 text-sm text-red-700 dark:text-red-400" role="alert">{erro}</p>}
    </div>
  )
}
