/** Utilidades de compartilhamento de um evento. */

export function urlDoEvento(evento) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/eventos/${evento.id}`
}

function textoConvite(evento) {
  return `${evento.titulo} — ${evento.cidade_nome}/${evento.uf}`
}

/**
 * Usa o compartilhamento nativo do sistema (celular) quando disponível.
 * Retorna true se abriu; false se não há suporte (aí use os links sociais).
 */
export async function compartilharNativo(evento) {
  if (typeof navigator === 'undefined' || !navigator.share) return false
  try {
    await navigator.share({
      title: evento.titulo,
      text: textoConvite(evento),
      url: urlDoEvento(evento),
    })
    return true
  } catch {
    return false // usuário cancelou ou falhou
  }
}

export async function copiarLink(evento) {
  const url = urlDoEvento(evento)
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

export function linksSociais(evento) {
  const url = encodeURIComponent(urlDoEvento(evento))
  const texto = encodeURIComponent(`${textoConvite(evento)} `)
  return [
    { nome: 'WhatsApp', href: `https://wa.me/?text=${texto}${url}` },
    { nome: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { nome: 'Telegram', href: `https://t.me/share/url?url=${url}&text=${texto}` },
    { nome: 'X (Twitter)', href: `https://twitter.com/intent/tweet?url=${url}&text=${texto}` },
  ]
}
