import { supabase, supabaseConfigurado } from './supabase'
import { distanciaAteEvento, dentroDoRaio } from './geo'
import { geocodificarEvento } from './geocode'

/**
 * Camada de acesso a dados da plataforma.
 *
 * Se o Supabase estiver configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY),
 * usa o banco real. Caso contrário, opera em "modo demonstração":
 *   - leitura a partir de /public/dados/*.json
 *   - eventos enviados ficam em localStorage (chave "eventos_enviados"),
 *     com ciclo de vida completo (pendente → aprovado/recusado)
 */

const CHAVE_ENVIADOS = 'eventos_enviados'
const CHAVE_CIDADES = 'cidades_enviadas' // modo demonstração: cidades sugeridas/criadas

let cacheLocal = null
async function carregarDadosLocais() {
  if (cacheLocal) return cacheLocal
  const [eventos, cidades] = await Promise.all([
    fetch('/dados/eventos.json').then((r) => r.json()),
    fetch('/dados/cidades.json').then((r) => r.json()),
  ])
  cacheLocal = { eventos, cidades }
  return cacheLocal
}

function lerEnviados() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_ENVIADOS) || '[]')
  } catch {
    return []
  }
}
function gravarEnviados(lista) {
  localStorage.setItem(CHAVE_ENVIADOS, JSON.stringify(lista))
}
function lerCidadesLocais() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CIDADES) || '[]')
  } catch {
    return []
  }
}
function gravarCidadesLocais(lista) {
  try {
    localStorage.setItem(CHAVE_CIDADES, JSON.stringify(lista))
  } catch {
    /* ignore */
  }
}

/** Slug limpo e estável a partir do nome da cidade (sem sufixo aleatório). */
export function slugCidade(nome = '') {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function normalizar(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
}

export function aplicarFiltros(eventos, filtros = {}) {
  const { busca, cidade, categoria, entrada, formato, quando, de, ate, ordenar, origem, raioKm } =
    filtros
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const lista = eventos
    .filter((e) => e.status === 'aprovado')
    .filter((e) => {
      // raio de distância ("perto de mim"): online sempre passa; presencial
      // precisa estar dentro do raio a partir da posição do visitante.
      if (!origem || raioKm == null) return true
      if ((e.formato || 'presencial') === 'online') return true
      return dentroDoRaio(distanciaAteEvento(origem, e), raioKm)
    })
    .filter((e) => {
      if (busca) {
        const alvo = normalizar(`${e.titulo} ${e.descricao} ${e.cidade_nome} ${e.local}`)
        if (!alvo.includes(normalizar(busca))) return false
      }
      if (cidade && e.cidade !== cidade) return false
      if (categoria && e.categoria !== categoria) return false
      if (entrada && e.entrada !== entrada) return false
      if (formato && (e.formato || 'presencial') !== formato) return false

      const fim = new Date(e.data_fim || e.data_inicio)
      const inicio = new Date(e.data_inicio)

      // intervalo de datas escolhido tem prioridade sobre o "quando"
      if (de || ate) {
        if (de && fim < new Date(de)) return false
        if (ate && inicio > new Date(ate)) return false
      } else if (quando) {
        if (quando === 'futuros' && fim < hoje) return false
        if (quando === 'encerrados' && fim >= hoje) return false
        if (quando === 'semana') {
          const em7dias = new Date(hoje)
          em7dias.setDate(em7dias.getDate() + 7)
          if (inicio > em7dias || fim < hoje) return false
        }
        if (quando === 'mes') {
          const em30dias = new Date(hoje)
          em30dias.setDate(em30dias.getDate() + 30)
          if (inicio > em30dias || fim < hoje) return false
        }
      }
      return true
    })

  if (ordenar === 'nome') return lista.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
  if (ordenar === 'recentes')
    return lista.sort((a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0))
  if (ordenar === 'perto' && origem) {
    const dist = (e) => distanciaAteEvento(origem, e) ?? Infinity
    return lista.sort((a, b) => dist(a) - dist(b) || new Date(a.data_inicio) - new Date(b.data_inicio))
  }
  // encerrados: os que terminaram há menos tempo primeiro
  if (quando === 'encerrados' && !ordenar)
    return lista.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio))
  return lista.sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
}

/* ============================ Cidades ============================ */

const ordenarNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR')

/**
 * Lista de cidades. Por padrão só as aprovadas (o que aparece no site).
 * `{ todas: true }` inclui as sugeridas ainda não publicadas — só a equipe usa.
 */
export async function listarCidades({ todas = false } = {}) {
  if (supabaseConfigurado) {
    let q = supabase.from('cidades').select('*').order('nome')
    if (!todas) q = q.eq('aprovada', true)
    const { data, error } = await q
    if (error) throw error
    return data
  }
  const { cidades } = await carregarDadosLocais()
  const juntas = [...cidades, ...lerCidadesLocais()]
  return juntas.filter((c) => todas || c.aprovada !== false).sort(ordenarNome)
}

export async function obterCidade(slug) {
  if (supabaseConfigurado) {
    const { data, error } = await supabase.from('cidades').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data
  }
  const { cidades } = await carregarDadosLocais()
  return [...cidades, ...lerCidadesLocais()].find((c) => c.slug === slug) || null
}

/**
 * Cria (ou reaproveita) uma cidade. `aprovada: false` = sugestão de organizador
 * que só aparece no site depois que a equipe aprova. `aprovada: true` = cadastro
 * direto pelo painel da equipe. Geocodifica o centro da cidade em segundo plano.
 */
export async function criarCidade(dados, { aprovada = false } = {}) {
  const nome = (dados.nome || '').trim()
  const uf = (dados.uf || '').trim().toUpperCase()
  if (!nome || uf.length !== 2) throw new Error('Informe o nome da cidade e o estado (UF).')

  // já existe uma cidade com esse nome/UF? reaproveita.
  const existentes = await listarCidades({ todas: true })
  const jaTem = existentes.find(
    (c) => normalizar(c.nome) === normalizar(nome) && c.uf?.toUpperCase() === uf,
  )
  if (jaTem) return jaTem

  let slug = slugCidade(nome)
  if (existentes.some((c) => c.slug === slug)) slug = `${slug}-${uf.toLowerCase()}`

  const co = await geocodificarEvento({ local: nome, cidade_nome: nome, uf })
  const registro = {
    slug,
    nome,
    uf,
    regiao: (dados.regiao || '').trim() || uf,
    descricao: (dados.descricao || '').trim(),
    site_prefeitura: (dados.site_prefeitura || '').trim() || null,
    lat: co?.lat ?? null,
    lng: co?.lng ?? null,
    imagem_url: '/img/cidades/_padrao.svg',
    aprovada,
  }

  if (supabaseConfigurado) {
    const { data, error } = await supabase.from('cidades').insert(registro).select().single()
    if (error) throw error
    return data
  }
  gravarCidadesLocais([...lerCidadesLocais().filter((c) => c.slug !== slug), registro])
  return registro
}

/** Marca uma cidade sugerida como publicada (ação da equipe). */
export async function aprovarCidade(slug) {
  if (supabaseConfigurado) {
    const { error } = await supabase.from('cidades').update({ aprovada: true }).eq('slug', slug)
    if (error) throw error
    return
  }
  gravarCidadesLocais(lerCidadesLocais().map((c) => (c.slug === slug ? { ...c, aprovada: true } : c)))
}

/* ===================== Eventos (público) ===================== */

export async function listarEventos(filtros = {}) {
  if (supabaseConfigurado) {
    let query = supabase.from('eventos').select('*').eq('status', 'aprovado')
    if (filtros.cidade) query = query.eq('cidade', filtros.cidade)
    if (filtros.categoria) query = query.eq('categoria', filtros.categoria)
    if (filtros.entrada) query = query.eq('entrada', filtros.entrada)
    if (filtros.formato) query = query.eq('formato', filtros.formato)
    const { data, error } = await query.order('data_inicio', { ascending: true })
    if (error) throw error
    // busca por texto, período, raio e ordenação aplicados no cliente (mesma regra dos dados locais)
    return aplicarFiltros(data, {
      busca: filtros.busca,
      quando: filtros.quando,
      de: filtros.de,
      ate: filtros.ate,
      ordenar: filtros.ordenar,
      origem: filtros.origem,
      raioKm: filtros.raioKm,
    })
  }
  const { eventos } = await carregarDadosLocais()
  return aplicarFiltros([...eventos, ...lerEnviados()], filtros)
}

export async function obterEvento(id) {
  if (supabaseConfigurado) {
    const { data, error } = await supabase.from('eventos').select('*').eq('id', id).single()
    if (error) throw error
    return data
  }
  const { eventos } = await carregarDadosLocais()
  return [...eventos, ...lerEnviados()].find((e) => e.id === id) || null
}

/* ===================== Envio de evento ===================== */

/** Gera um slug legível a partir do título + sufixo curto para evitar colisão. */
export function gerarSlug(titulo = 'evento') {
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
  const sufixo = Math.random().toString(36).slice(2, 7)
  return `${base || 'evento'}-${sufixo}`
}

// Colunas reais da tabela "eventos" (o formulário tem campos extras, como
// "aceite", que não podem ir no insert).
const COLUNAS_EVENTO = [
  'id', 'titulo', 'descricao', 'descricao_completa', 'categoria', 'formato', 'cidade',
  'cidade_nome', 'uf', 'local', 'endereco', 'lat', 'lng', 'recorrencia', 'motivo_recusa', 'patrocinado',
  'data_inicio', 'data_fim', 'horario',
  'entrada', 'preco_texto', 'imagem_url', 'link_oficial', 'organizador_nome',
  'organizador_contato', 'criado_por', 'destaque', 'status', 'criado_em',
]
const CAMPOS_DATA = ['data_inicio', 'data_fim']

/** Mantém só as colunas válidas e troca string vazia por null (datas exigem isso). */
export function montarRegistroEvento(dados) {
  const r = {}
  for (const col of COLUNAS_EVENTO) {
    let v = dados[col]
    if (v === '' || v === undefined) v = null
    if (v && CAMPOS_DATA.includes(col)) v = String(v).slice(0, 10) // YYYY-MM-DD
    r[col] = v
  }
  return r
}

/**
 * Envia um evento para moderação (status "pendente").
 * `usuario` (opcional) associa o evento a quem o cadastrou.
 */
export const CIDADE_NOVA = '__nova__'

export async function enviarEvento(dados, usuario = null) {
  const completo = {
    ...dados,
    id: dados.id || gerarSlug(dados.titulo),
    formato: dados.formato || 'presencial',
    destaque: dados.destaque === true, // nunca null: a coluna é not null
    status: 'pendente',
    criado_em: new Date().toISOString(),
    criado_por: usuario?.id || null,
  }

  // Cidade fora da lista: cria como "sugerida" (só entra no site quando a equipe
  // aprova o evento) e aponta o evento para ela.
  if (dados.cidade === CIDADE_NOVA) {
    const nova = await criarCidade(
      { nome: dados.cidade_nova_nome, uf: dados.cidade_nova_uf },
      { aprovada: false },
    )
    completo.cidade = nova.slug
    completo.cidade_nome = nova.nome
    completo.uf = nova.uf
  }

  // Descobre a lat/lng do local pelo endereço, para a distância "perto de mim".
  // É um "melhor esforço": se o geocoder não responder, o evento entra sem
  // coordenadas e a distância cai no centro da cidade.
  if (completo.lat == null || completo.lng == null) {
    const co = await geocodificarEvento(completo)
    if (co) {
      completo.lat = co.lat
      completo.lng = co.lng
    }
  }

  const registro = montarRegistroEvento(completo)
  // guardado só localmente (não vai pro banco): ajuda o organizador a se achar
  registro.criado_por_email = usuario?.email || dados.organizador_contato || null

  if (supabaseConfigurado) {
    const { criado_por_email, ...resto } = registro
    // remove os campos nulos para as colunas com DEFAULT no banco assumirem o
    // valor padrão (enviar null explícito quebra colunas "not null default …").
    const paraBanco = Object.fromEntries(
      Object.entries(resto).filter(([, v]) => v !== null),
    )
    const { error } = await supabase.from('eventos').insert(paraBanco)
    if (error) throw error
    return registro
  }

  gravarEnviados([...lerEnviados(), registro])
  return registro
}

/* ================= Área do organizador ================= */

/** Eventos cadastrados pela pessoa logada, em qualquer status. */
export async function listarMeusEventos(usuario) {
  if (!usuario) return []
  if (supabaseConfigurado) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('criado_por', usuario.id)
      .order('criado_em', { ascending: false })
    if (error) throw error
    return data
  }
  return lerEnviados()
    .filter((e) => e.criado_por === usuario.id || e.criado_por_email === usuario.email)
    .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
}

/* ================= Área da equipe ================= */

export async function listarEventosPendentes() {
  if (!supabaseConfigurado) {
    return lerEnviados()
      .filter((e) => e.status === 'pendente')
      .sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em))
  }
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('status', 'pendente')
    .order('criado_em', { ascending: true })
  if (error) throw error
  return data
}

/** Todos os eventos (qualquer status) — base das métricas do painel. */
export async function listarTodosEventos() {
  if (!supabaseConfigurado) {
    const { eventos } = await carregarDadosLocais()
    return [...eventos, ...lerEnviados()]
  }
  const { data, error } = await supabase.from('eventos').select('*')
  if (error) throw error
  return data
}

export async function moderarEvento(id, status, motivo = '') {
  const motivoRecusa = status === 'recusado' ? motivo.trim() || null : null
  if (!supabaseConfigurado) {
    let slugCid = null
    const lista = lerEnviados().map((e) => {
      if (e.id !== id) return e
      slugCid = e.cidade
      return { ...e, status, motivo_recusa: motivoRecusa }
    })
    gravarEnviados(lista)
    if (status === 'aprovado' && slugCid) await aprovarCidade(slugCid)
    return
  }
  // aprovar o evento também publica a cidade dele, se ela ainda era só uma sugestão
  if (status === 'aprovado') {
    const { data: ev } = await supabase.from('eventos').select('cidade').eq('id', id).maybeSingle()
    if (ev?.cidade) {
      await supabase.from('cidades').update({ aprovada: true }).eq('slug', ev.cidade)
    }
  }
  const { error } = await supabase
    .from('eventos')
    .update({ status, motivo_recusa: motivoRecusa })
    .eq('id', id)
  if (error) throw error

  // avisa o organizador por e-mail (só funciona se o SMTP estiver configurado
  // na Vercel; se não, a função responde "enviado: false" e nada quebra)
  try {
    const { data: sessao } = await supabase.auth.getSession()
    const token = sessao?.session?.access_token
    if (token) {
      await fetch('/api/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token, evento_id: id, status, motivo: motivoRecusa }),
      })
    }
  } catch {
    /* notificação é "melhor esforço" — nunca bloqueia a moderação */
  }
}

/* ================= Contato ================= */

const CHAVE_CONTATOS = 'contatos_locais'

export async function enviarContato({ nome, email, assunto, mensagem }) {
  const registro = {
    nome: (nome || '').trim(),
    email: (email || '').trim(),
    assunto: (assunto || '').trim(),
    mensagem: (mensagem || '').trim(),
    criado_em: new Date().toISOString(),
  }
  if (!registro.nome || !registro.email || !registro.mensagem) {
    throw new Error('Preencha nome, e-mail e mensagem.')
  }
  if (supabaseConfigurado) {
    const { error } = await supabase.from('contatos').insert(registro)
    if (error) throw error
    return
  }
  try {
    const l = JSON.parse(localStorage.getItem(CHAVE_CONTATOS) || '[]')
    localStorage.setItem(CHAVE_CONTATOS, JSON.stringify([registro, ...l]))
  } catch {
    /* ignore */
  }
}

/** Mensagens de contato (só a equipe lê). */
export async function listarContatos() {
  if (supabaseConfigurado) {
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .order('criado_em', { ascending: false })
    if (error) throw error
    return data
  }
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CONTATOS) || '[]')
  } catch {
    return []
  }
}

/* ================= Destaque pago (fluxo manual, sem gateway) ================= */

const CHAVE_PEDIDOS = 'pedidos_destaque_locais'
export const VALOR_DESTAQUE = { 7: 30, 15: 55, 30: 90 } // R$ por período (ilustrativo)

export async function solicitarDestaque({ evento_id, dias, observacao }, usuario) {
  const registro = {
    evento_id,
    dias: Number(dias) || 7,
    observacao: (observacao || '').trim() || null,
    status: 'solicitado',
    criado_por: usuario?.id || null,
    criado_em: new Date().toISOString(),
  }
  if (supabaseConfigurado) {
    const { error } = await supabase.from('pedidos_destaque').insert(registro)
    if (error) throw error
    return
  }
  try {
    const l = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]')
    localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify([{ id: registro.criado_em, ...registro }, ...l]))
  } catch {
    /* ignore */
  }
}

/** Pedidos de destaque de um evento (para o organizador saber que já pediu). */
export async function pedidosDoEvento(evento_id) {
  if (supabaseConfigurado) {
    const { data } = await supabase
      .from('pedidos_destaque')
      .select('*')
      .eq('evento_id', evento_id)
      .order('criado_em', { ascending: false })
    return data || []
  }
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]').filter((p) => p.evento_id === evento_id)
  } catch {
    return []
  }
}

export async function listarPedidosDestaque() {
  if (supabaseConfigurado) {
    const { data, error } = await supabase
      .from('pedidos_destaque')
      .select('*, eventos(titulo, cidade_nome, uf)')
      .order('criado_em', { ascending: false })
    if (error) throw error
    return data
  }
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]')
  } catch {
    return []
  }
}

/** A equipe confirma o pagamento (liga o destaque) ou recusa o pedido. */
export async function resolverPedidoDestaque(pedido, novoStatus) {
  if (supabaseConfigurado) {
    const { data, error } = await supabase
      .from('pedidos_destaque')
      .update({ status: novoStatus })
      .eq('id', pedido.id)
      .select()
    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error('sem permissão para alterar (rode supabase/extras.sql e confira a tabela equipe).')
    }
    if (novoStatus === 'pago') {
      await supabase
        .from('eventos')
        .update({ destaque: true, patrocinado: true })
        .eq('id', pedido.evento_id)
    }
    return
  }
  try {
    const l = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]').map((p) =>
      p.id === pedido.id ? { ...p, status: novoStatus } : p,
    )
    localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(l))
  } catch {
    /* ignore */
  }
  if (novoStatus === 'pago') {
    await alternarDestaque(pedido.evento_id, true)
    try {
      const p = JSON.parse(localStorage.getItem('patrocinados_locais') || '[]')
      localStorage.setItem('patrocinados_locais', JSON.stringify([...new Set([...p, pedido.evento_id])]))
    } catch {
      /* ignore */
    }
  }
}

/** Um evento aparece como "Patrocinado"? (demo: localStorage; real: coluna patrocinado) */
export function ehPatrocinado(evento) {
  if (evento?.patrocinado === true) return true
  try {
    return JSON.parse(localStorage.getItem('patrocinados_locais') || '[]').includes(evento?.id)
  } catch {
    return false
  }
}

/* ================= Destaques (curadoria da equipe) ================= */

const CHAVE_DESTAQUES = 'destaques_locais' // { [id]: boolean } — sobrepõe o valor do JSON

function lerOverridesDestaque() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_DESTAQUES) || '{}')
  } catch {
    return {}
  }
}

/** Aplica o override local (modo demonstração) sobre o valor de destaque do evento. */
export function ehDestaque(evento, overrides = lerOverridesDestaque()) {
  return overrides[evento.id] ?? evento.destaque === true
}

/** Eventos marcados como destaque pela equipe, aprovados e que ainda não terminaram. */
export async function listarDestaques() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const futuros = (e) => new Date(e.data_fim || e.data_inicio) >= hoje

  if (supabaseConfigurado) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('status', 'aprovado')
      .eq('destaque', true)
      .order('data_inicio', { ascending: true })
    if (error) throw error
    return data.filter(futuros)
  }
  const { eventos } = await carregarDadosLocais()
  const over = lerOverridesDestaque()
  return [...eventos, ...lerEnviados()]
    .filter((e) => e.status === 'aprovado' && ehDestaque(e, over))
    .filter(futuros)
    .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
}

/** Liga/desliga o destaque de um evento (ação da equipe). */
export async function alternarDestaque(id, valor) {
  if (supabaseConfigurado) {
    const { error } = await supabase.from('eventos').update({ destaque: valor }).eq('id', id)
    if (error) throw error
    return
  }
  const over = lerOverridesDestaque()
  over[id] = valor
  localStorage.setItem(CHAVE_DESTAQUES, JSON.stringify(over))
}
