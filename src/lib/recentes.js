/** "Vistos recentemente" — guardado só no navegador (localStorage). */

const CHAVE = 'vistos_recentemente'
const MAX = 8

function ler() {
  try {
    const l = JSON.parse(localStorage.getItem(CHAVE) || '[]')
    return Array.isArray(l) ? l : []
  } catch {
    return []
  }
}

/** Registra um evento como visto (vai pro topo, sem repetir). */
export function registrarVisto(evento) {
  if (!evento?.id) return
  const item = {
    id: evento.id,
    titulo: evento.titulo,
    descricao: evento.descricao,
    cidade: evento.cidade,
    cidade_nome: evento.cidade_nome,
    uf: evento.uf,
    local: evento.local,
    lat: evento.lat ?? null,
    lng: evento.lng ?? null,
    imagem_url: evento.imagem_url,
    categoria: evento.categoria,
    data_inicio: evento.data_inicio,
    data_fim: evento.data_fim ?? null,
    entrada: evento.entrada,
    status: 'aprovado',
  }
  try {
    const nova = [item, ...ler().filter((e) => e.id !== evento.id)].slice(0, MAX)
    localStorage.setItem(CHAVE, JSON.stringify(nova))
  } catch {
    /* ignore */
  }
}

/** Lista dos vistos, opcionalmente sem um id e sem os que já passaram. */
export function listarVistos({ excluirId, apenasFuturos = true } = {}) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return ler().filter((e) => {
    if (excluirId && e.id === excluirId) return false
    if (apenasFuturos) {
      const fim = new Date(e.data_fim || e.data_inicio)
      if (fim < hoje) return false
    }
    return true
  })
}
