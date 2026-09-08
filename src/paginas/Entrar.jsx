import { useState } from 'react'
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Entrar() {
  const navigate = useNavigate()
  const local = useLocation()
  const destino = local.state?.de || '/organizador'
  const { entrar, cadastrar, entrarDemo, modoDemo, autenticado, ehEquipe } = useAuth()

  const [modo, setModo] = useState('entrar') // 'entrar' | 'cadastrar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  if (autenticado) {
    return <Navigate to={ehEquipe ? '/painel' : '/organizador'} replace />
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setOcupado(true)
    try {
      if (modo === 'entrar') await entrar(email, senha)
      else await cadastrar(email, senha)
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(
        err?.message?.includes('already registered')
          ? 'Este e-mail já tem conta. Use "Entrar".'
          : 'Não foi possível. Verifique e-mail e senha (mínimo 6 caracteres).',
      )
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="container-pagina flex justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-xl bg-superficie p-8 shadow-sm ring-1 ring-borda/10">
          <h1 className="text-3xl">{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h1>
          <p className="mt-1 text-sm text-suave">
            Para organizadores acompanharem seus eventos e para a equipe moderar a plataforma.
          </p>

          {modoDemo && (
            <div className="mt-4 rounded-lg border-l-4 border-destaque bg-destaque/10 p-3 text-xs text-texto">
              <p className="font-semibold">Modo demonstração</p>
              <p className="mt-1">Sem banco conectado. Entre direto com um papel:</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="btn-tinta flex-1 !py-1.5 text-xs"
                  onClick={() => {
                    entrarDemo('organizador')
                    navigate('/organizador')
                  }}
                >
                  Como organizador
                </button>
                <button
                  className="btn-contorno flex-1 !py-1.5 text-xs"
                  onClick={() => {
                    entrarDemo('equipe')
                    navigate('/painel')
                  }}
                >
                  Como equipe
                </button>
              </div>
            </div>
          )}

          <form onSubmit={enviar} className="mt-6 space-y-4">
            <div>
              <label className="rotulo" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="campo" value={email} required
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="rotulo" htmlFor="senha">Senha</label>
              <input id="senha" type="password" className="campo" value={senha} required minLength={6}
                onChange={(e) => setSenha(e.target.value)} />
            </div>
            {erro && <p className="text-sm text-red-700 dark:text-red-400" role="alert">{erro}</p>}
            <button type="submit" className="btn-destaque w-full" disabled={ocupado}>
              {ocupado ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <button
            className="mt-4 text-sm text-texto underline"
            onClick={() => setModo((m) => (m === 'entrar' ? 'cadastrar' : 'entrar'))}
          >
            {modo === 'entrar' ? 'Não tem conta? Criar agora' : 'Já tenho conta'}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-suave">
          Só quer ver eventos? <Link to="/eventos" className="underline">Ir para a agenda</Link>
        </p>
      </div>
    </div>
  )
}
