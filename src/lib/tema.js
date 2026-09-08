import { useEffect, useState } from 'react'

/**
 * Tema visual: 'claro' | 'escuro' | 'sistema'.
 * A escolha fica no localStorage. 'sistema' segue a preferência do SO.
 * A classe .dark no <html> liga o tema escuro (ver tailwind.config darkMode: 'class').
 */

const CHAVE = 'tema'
export const TEMAS = ['claro', 'escuro', 'sistema']

export function obterTema() {
  try {
    const t = localStorage.getItem(CHAVE)
    return TEMAS.includes(t) ? t : 'sistema'
  } catch {
    return 'sistema'
  }
}

function escuroAgora(tema) {
  if (tema === 'escuro') return true
  if (tema === 'claro') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function aplicarTema(tema = obterTema()) {
  document.documentElement.classList.toggle('dark', escuroAgora(tema))
}

export function definirTema(tema) {
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // sem localStorage — aplica só nesta sessão
  }
  aplicarTema(tema)
}

export function useTema() {
  const [tema, setTema] = useState(obterTema)

  useEffect(() => {
    aplicarTema(tema)
    if (tema !== 'sistema') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const aoMudar = () => aplicarTema('sistema')
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [tema])

  return [
    tema,
    (novo) => {
      definirTema(novo)
      setTema(novo)
    },
  ]
}
