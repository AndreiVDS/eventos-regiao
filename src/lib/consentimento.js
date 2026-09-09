import { useCallback, useEffect, useState } from 'react'

/**
 * Consentimento de armazenamento (LGPD).
 *
 * Hoje o site guarda no navegador só o necessário para funcionar
 * (tema, cidade escolhida, sessão, rascunhos) e NÃO usa rastreadores de
 * terceiros nem analytics. O banner serve de transparência e deixa o
 * caminho pronto caso uma medição opcional seja adicionada no futuro.
 */

const CHAVE = 'consentimento'
const VERSAO = 1 // aumente se a política mudar → o banner reaparece

function ler() {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) || 'null')
    if (bruto && bruto.versao === VERSAO) return bruto
  } catch {
    /* localStorage indisponível */
  }
  return null
}

export function useConsentimento() {
  const [estado, setEstado] = useState(ler)

  // se outra aba responder o banner, esta acompanha
  useEffect(() => {
    const aoMudar = (e) => e.key === CHAVE && setEstado(ler())
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [])

  const registrar = useCallback((extra = {}) => {
    const valor = { versao: VERSAO, em: new Date().toISOString(), essencial: true, ...extra }
    try {
      localStorage.setItem(CHAVE, JSON.stringify(valor))
    } catch {
      /* sem localStorage — vale só nesta sessão */
    }
    setEstado(valor)
  }, [])

  const reabrir = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE)
    } catch {
      /* ignore */
    }
    setEstado(null)
  }, [])

  return { estado, respondido: Boolean(estado), registrar, reabrir }
}
