import { supabase, supabaseConfigurado } from './supabase'

/**
 * Camada de acesso a dados da plataforma.
 *
 * Estratégia: se o Supabase estiver configurado (variáveis de ambiente
 * VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY), usamos o banco real.
 * Caso contrário, caímos para os arquivos de exemplo em /public/dados,
 * para que o site rode e possa ser demonstrado sem depender de infraestrutura.
 */

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

function normalizar(texto = '') {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
}

function aplicarFiltros(eventos, filtros = {}) {
  const { busca, cidade, categoria, entrada, quando } = filtros
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return eventos
    .filter((e) => e.status === 'aprovado')
    .filter((e) => {
      if (busca) {
        const alvo = normalizar(`${e.titulo} ${e.descricao} ${e.cidade_nome} ${e.local}`)
        if (!alvo.includes(normalizar(busca))) return false
      }
      if (cidade && e.cidade !== cidade) return false
      if (categoria && e.categoria !== categoria) return false
      if (entrada && e.entrada !== entrada) return false
      if (quando) {
        const fim = new Date(e.data_fim || e.data_inicio)
        const inicio = new Date(e.data_inicio)
        if (quando === 'futuros' && fim < hoje) return false
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
    .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
}

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

export async function listarEventos(filtros = {}) {
  if (supabaseConfigurado) {
    let query = supabase.from('eventos').select('*').eq('status', 'aprovado')
    if (filtros.cidade) query = query.eq('cidade', filtros.cidade)
    if (filtros.categoria) query = query.eq('categoria', filtros.categoria)
    if (filtros.entrada) query = query.eq('entrada', filtros.entrada)
    const { data, error } = await query.order('data_inicio', { ascending: true })
    if (error) throw error
    // Filtros de texto e período aplicados no cliente (mesma regra dos dados locais).
    return aplicarFiltros(data, { busca: filtros.busca, quando: filtros.quando })
  }
  const { eventos } = await carregarDadosLocais()
  return aplicarFiltros(eventos, filtros)
}

export async function obterEvento(id) {
  if (supabaseConfigurado) {
    const { data, error } = await supabase.from('eventos').select('*').eq('id', id).single()
    if (error) throw error
    return data
  }
  const { eventos } = await carregarDadosLocais()
  return eventos.find((e) => e.id === id) || null
}

/**
 * Envia um evento para moderação. Fica com status "pendente" até um
 * organizador da plataforma aprovar no painel.
 */
export async function enviarEvento(dados) {
  const registro = {
    ...dados,
    id: dados.id || crypto.randomUUID(),
    status: 'pendente',
    criado_em: new Date().toISOString(),
  }

  if (supabaseConfigurado) {
    const { error } = await supabase.from('eventos').insert(registro)
    if (error) throw error
    return registro
  }

  // Sem backend: guardamos como rascunho local e avisamos a pessoa.
  const rascunhos = JSON.parse(localStorage.getItem('eventos_pendentes') || '[]')
  rascunhos.push(registro)
  localStorage.setItem('eventos_pendentes', JSON.stringify(rascunhos))
  return registro
}

/* ----- Painel de moderação (requer Supabase + login) ----- */

export async function listarEventosPendentes() {
  if (!supabaseConfigurado) {
    return JSON.parse(localStorage.getItem('eventos_pendentes') || '[]')
  }
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('status', 'pendente')
    .order('criado_em', { ascending: true })
  if (error) throw error
  return data
}

export async function moderarEvento(id, status) {
  if (!supabaseConfigurado) {
    const rascunhos = JSON.parse(localStorage.getItem('eventos_pendentes') || '[]')
    localStorage.setItem('eventos_pendentes', JSON.stringify(rascunhos.filter((e) => e.id !== id)))
    return
  }
  const { error } = await supabase.from('eventos').update({ status }).eq('id', id)
  if (error) throw error
}
