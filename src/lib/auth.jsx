import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigurado } from './supabase'
import { SITE_URL } from './meta'

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
  const [equipeDB, setEquipeDB] = useState(false) // e-mail está na tabela public.equipe?
  const [recuperando, setRecuperando] = useState(false) // fluxo de "redefinir senha" ativo

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
    const { data: sub } = supabase.auth.onAuthStateChange((evt, session) => {
      if (evt === 'PASSWORD_RECOVERY') setRecuperando(true)
      setUsuario(session?.user ? { id: session.user.id, email: session.user.email } : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // confere se o e-mail logado está na tabela public.equipe (além do env)
  useEffect(() => {
    if (!supabaseConfigurado || !usuario) {
      setEquipeDB(false)
      return
    }
    let ativo = true
    supabase
      .from('equipe')
      .select('email')
      .limit(1)
      .then(({ data }) => ativo && setEquipeDB((data?.length || 0) > 0))
      .catch(() => ativo && setEquipeDB(false))
    return () => {
      ativo = false
    }
  }, [usuario])

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

    /** Envia o e-mail de redefinição de senha (usa o remetente do próprio Supabase). */
    async function pedirRedefinicao(email) {
      if (!supabaseConfigurado) throw new Error('Disponível quando o banco estiver conectado.')
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/redefinir-senha`,
      })
      if (error) throw error
    }

    /** Define a nova senha (a sessão de recuperação já vem do link do e-mail). */
    async function definirNovaSenha(nova) {
      if (!supabaseConfigurado) throw new Error('Disponível quando o banco estiver conectado.')
      const { error } = await supabase.auth.updateUser({ password: nova })
      if (error) throw error
      setRecuperando(false)
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

    const ehEquipe = (usuario?.papelForcado || papel) === 'equipe' || equipeDB

    return {
      usuario,
      papel: ehEquipe ? 'equipe' : 'organizador',
      autenticado: Boolean(usuario),
      ehEquipe,
      carregando,
      recuperando,
      modoDemo: !supabaseConfigurado,
      entrar,
      cadastrar,
      entrarDemo,
      pedirRedefinicao,
      definirNovaSenha,
      sair,
    }
  }, [usuario, carregando, equipeDB, recuperando])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
