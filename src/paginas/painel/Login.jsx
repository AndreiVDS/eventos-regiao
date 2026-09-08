import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigurado } from '../../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  useEffect(() => {
    if (!supabaseConfigurado) return
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/painel/moderacao', { replace: true })
    })
  }, [navigate])

  async function entrar(e) {
    e.preventDefault()
    setErro('')

    if (!supabaseConfigurado) {
      // Modo demonstração: sem autenticação real, entra direto no painel local.
      navigate('/painel/moderacao')
      return
    }

    setEntrando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setEntrando(false)
    if (error) {
      setErro('E-mail ou senha inválidos.')
      return
    }
    navigate('/painel/moderacao')
  }

  return (
    <div className="container-pagina flex justify-center py-16">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-tinta/10"
      >
        <h1 className="text-3xl">Painel da equipe</h1>
        <p className="mt-1 text-sm text-tinta/70">
          Acesso restrito a quem modera os eventos enviados.
        </p>

        {!supabaseConfigurado && (
          <p className="mt-4 rounded-lg bg-destaque/20 p-3 text-xs text-tinta">
            Modo demonstração: sem banco conectado, o painel mostra apenas os envios salvos neste
            navegador. Clique em entrar para continuar.
          </p>
        )}

        {supabaseConfigurado && (
          <>
            <div className="mt-6">
              <label className="rotulo" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="campo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="rotulo" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                className="campo"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {erro && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" className="btn-destaque mt-6 w-full" disabled={entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
