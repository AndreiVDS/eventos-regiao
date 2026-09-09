import { supabase, supabaseConfigurado } from './supabase'
import { distanciaAteSlug, dentroDoRaio } from './geo'

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
      return dentroDoRaio(distanciaAteSlug(origem, e.cidade), raioKm)
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
    const dist = (e) => distanciaAteSlug(origem, e.cidade) ?? Infinity
    return lista.sort((a, b) => dist(a) - dist(b) || new Date(a.data_inicio) - new Date(b.data_inicio))
  }
  // encerrados: os que terminaram há menos tempo primeiro
  if (quando === 'encerrados' && !ordenar)
    return lista.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio))
  return lista.sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
}

/* ============================ Cidades ============================ */

export async function listarCidades() {
  if (supabaseConfigurado) {
    const { data, error } = await supabase.from('cidades').select('*').order('nome')
    if (error) throw error
    return data
  }
  const { cidades } = await carregarDadosLocais()
  return [...cidades].sort((a, b) => a.nome.localeCompare(b.nome))
}

export async function obterCidade(slug) {
  if (supabaseConfigurado) {
    const { data, error } = await supabase.from('cidades').select('*').eq('slug', slug).single()
    if (error) throw error
    return data
  }
  const { cidades } = await carregarDadosLocais()
  return cidades.find((c) => c.slug === slug) || null
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
  'cidade_nome', 'uf', 'local', 'endereco', 'data_inicio', 'data_fim', 'horario',
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
export async function enviarEvento(dados, usuario = null) {
  const completo = {
    ...dados,
    id: dados.id || gerarSlug(dados.titulo),
    formato: dados.formato || 'presencial',
    status: 'pendente',
    criado_em: new Date().toISOString(),
    criado_por: usuario?.id || null,
  }
  const registro = montarRegistroEvento(completo)
  // guardado só localmente (não vai pro banco): ajuda o organizador a se achar
  registro.criado_por_email = usuario?.email || dados.organizador_contato || null

  if (supabaseConfigurado) {
    const { criado_por_email, ...paraBanco } = registro
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

export async function moderarEvento(id, status) {
  if (!supabaseConfigurado) {
    const lista = lerEnviados().map((e) => (e.id === id ? { ...e, status } : e))
    gravarEnviados(lista)
    return
  }
  const { error } = await supabase.from('eventos').update({ status }).eq('id', id)
  if (error) throw error
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
