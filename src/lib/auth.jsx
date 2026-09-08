import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigurado } from './supabase'

/**
 * Autenticação da plataforma.
 *
 * - Com Supabase configurado: usa Supabase Auth (e-mail + senha).
 * - Sem Supabase (modo demonstração): mantém uma "sessão" local no
 *   navegador, para que os fluxos de organizador e de equipe possam
 *   ser demonstrados sem infraestrutura.
 *
 * O papel ("organizador" ou "equipe") é derivado do e-mail: e-mails
 * listados em VITE_ADMIN_EMAILS entram como equipe; os demais, como
 * organizador.
 */

const AuthContext = createContext(null)

const ADMINS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function papelDoEmail(email) {
  if (!email) return 'organizador'
  return ADMINS.includes(email.toLowerCase()) ? 'equipe' : 'organizador'
}

const CHAVE_DEMO = 'sessao_demo'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) {
      try {
        const bruto = localStorage.getItem(CHAVE_DEMO)
        if (bruto) setUsuario(JSON.parse(bruto))
      } catch {
        // localStorage indisponível — segue sem sessão
      }
      setCarregando(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user ? { id: data.session.user.id, email: data.session.user.email } : null)
      setCarregando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUsuario(session?.user ? { id: session.user.id, email: session.user.email } : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const valor = useMemo(() => {
    const papel = papelDoEmail(usuario?.email)

    async function entrar(email, senha) {
      if (!supabaseConfigurado) {
        const u = { id: `demo-${email}`, email, demo: true }
        localStorage.setItem(CHAVE_DEMO, JSON.stringify(u))
        setUsuario(u)
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) throw error
    }

    async function cadastrar(email, senha) {
      if (!supabaseConfigurado) return entrar(email, senha)
      const { error } = await supabase.auth.signUp({ email, password: senha })
      if (error) throw error
    }

    /** Atalho do modo demonstração: entra já com um papel escolhido. */
    function entrarDemo(papelAlvo) {
      const email = papelAlvo === 'equipe' ? 'equipe@demo.local' : 'organizador@demo.local'
      const u = { id: `demo-${papelAlvo}`, email, demo: true, papelForcado: papelAlvo }
      localStorage.setItem(CHAVE_DEMO, JSON.stringify(u))
      setUsuario(u)
    }

    async function sair() {
      if (supabaseConfigurado) await supabase.auth.signOut()
      localStorage.removeItem(CHAVE_DEMO)
      setUsuario(null)
    }

    return {
      usuario,
      papel: usuario?.papelForcado || papel,
      autenticado: Boolean(usuario),
      ehEquipe: (usuario?.papelForcado || papel) === 'equipe',
      carregando,
      modoDemo: !supabaseConfigurado,
      entrar,
      cadastrar,
      entrarDemo,
      sair,
    }
  }, [usuario, carregando])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
