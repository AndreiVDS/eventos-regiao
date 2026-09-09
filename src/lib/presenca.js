import { supabase, supabaseConfigurado } from './supabase'

/**
 * "Vou participar" (RSVP).
 * Com Supabase: tabela `presencas` (evento_id, usuario_id).
 * Sem Supabase (demonstração): as confirmações do usuário ficam no
 * localStorage; a contagem mostrada é só a do próprio usuário.
 */

const CHAVE = 'presencas_locais'

function lerLocais() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHAVE) || '[]'))
  } catch {
    return new Set()
  }
}
function gravarLocais(set) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify([...set]))
  } catch {
    // sem localStorage — vale só nesta sessão
  }
}

/** Nº de confirmações de um evento. */
export async function contarPresencas(eventoId) {
  if (!supabaseConfigurado) {
    return lerLocais().has(eventoId) ? 1 : 0
  }
  const { count, error } = await supabase
    .from('presencas')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', eventoId)
  if (error) throw error
  return count || 0
}

/** O usuário logado já confirmou presença neste evento? */
export async function minhaPresenca(eventoId, usuario) {
  if (!usuario) return false
  if (!supabaseConfigurado) return lerLocais().has(eventoId)
  const { data, error } = await supabase
    .from('presencas')
    .select('evento_id')
    .eq('evento_id', eventoId)
    .eq('usuario_id', usuario.id)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

/** Marca (vai=true) ou desmarca (vai=false) a presença do usuário. */
export async function definirPresenca(eventoId, usuario, vai) {
  if (!usuario) throw new Error('Entre para confirmar presença.')
  if (!supabaseConfigurado) {
    const set = lerLocais()
    if (vai) set.add(eventoId)
    else set.delete(eventoId)
    gravarLocais(set)
    return
  }
  if (vai) {
    const { error } = await supabase
      .from('presencas')
      .upsert({ evento_id: eventoId, usuario_id: usuario.id })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('presencas')
      .delete()
      .eq('evento_id', eventoId)
      .eq('usuario_id', usuario.id)
    if (error) throw error
  }
}

/** Contagem de confirmações para vários eventos de uma vez (área do organizador). */
export async function contarPresencasEm(eventoIds = []) {
  if (eventoIds.length === 0) return {}
  if (!supabaseConfigurado) {
    const set = lerLocais()
    return Object.fromEntries(eventoIds.map((id) => [id, set.has(id) ? 1 : 0]))
  }
  const { data, error } = await supabase
    .from('presencas')
    .select('evento_id')
    .in('evento_id', eventoIds)
  if (error) throw error
  const contagem = {}
  for (const id of eventoIds) contagem[id] = 0
  for (const row of data) contagem[row.evento_id] = (contagem[row.evento_id] || 0) + 1
  return contagem
}
