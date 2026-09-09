import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useMeta } from '../lib/meta'

export default function RedefinirSenha() {
  const navigate = useNavigate()
  const { recuperando, definirNovaSenha, modoDemo } = useAuth()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  useMeta({ titulo: 'Criar nova senha', caminho: '/redefinir-senha' })

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setOcupado(true)
    try {
      await definirNovaSenha(senha)
      setOk(true)
      setTimeout(() => navigate('/organizador', { replace: true }), 1500)
    } catch (err) {
      setErro(err?.message || 'Não foi possível trocar a senha. Peça um novo link.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="container-pagina flex justify-center py-16">
      <div className="w-full max-w-sm rounded-xl bg-superficie p-8 shadow-suave ring-1 ring-borda/10">
        <h1 className="text-3xl">Criar nova senha</h1>

        {modoDemo ? (
          <p className="mt-3 text-sm text-suave">
            Este fluxo funciona quando o banco está conectado.
          </p>
        ) : ok ? (
          <p className="mt-3 rounded-lg bg-destaque/15 p-3 text-sm text-texto" role="status">
            Senha alterada! Entrando…
          </p>
        ) : !recuperando ? (
          <p className="mt-3 text-sm text-suave">
            Abra esta página pelo link que enviamos por e-mail. Se o link expirou,{' '}
            <Link to="/entrar" className="underline">peça um novo</Link>.
          </p>
        ) : (
          <form onSubmit={enviar} className="mt-6 space-y-4">
            <div>
              <label className="rotulo" htmlFor="nova-senha">Nova senha</label>
              <input
                id="nova-senha"
                type="password"
                className="campo"
                value={senha}
                required
                minLength={6}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            {erro && <p className="text-sm text-red-700 dark:text-red-400" role="alert">{erro}</p>}
            <button type="submit" className="btn-destaque w-full" disabled={ocupado}>
              {ocupado ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
