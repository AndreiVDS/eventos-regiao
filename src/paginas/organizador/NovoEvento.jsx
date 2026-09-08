import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormularioEvento, { EVENTO_VAZIO } from '../../componentes/FormularioEvento'
import { enviarEvento } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function NovoEvento() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [ok, setOk] = useState(false)

  const inicial = { ...EVENTO_VAZIO, organizador_contato: usuario?.email || '' }

  return (
    <div className="container-pagina py-10">
      <nav aria-label="Trilha" className="text-sm text-suave">
        <Link to="/organizador" className="hover:underline">Meus eventos</Link> / Novo
      </nav>
      <h1 className="mt-2 text-4xl">Cadastrar evento</h1>
      <p className="mt-1 max-w-2xl text-suave">
        O evento entra como <strong>“em revisão”</strong>. Assim que a equipe aprovar, ele aparece
        na agenda pública e no seu histórico como “publicado”.
      </p>

      {ok ? (
        <div className="mt-8 rounded-xl bg-superficie p-8 text-center shadow-sm ring-1 ring-borda/10">
          <p className="text-5xl" aria-hidden="true">✅</p>
          <h2 className="mt-3 text-2xl">Enviado para revisão</h2>
          <div className="mt-5 flex justify-center gap-3">
            <button className="btn-contorno" onClick={() => setOk(false)}>Cadastrar outro</button>
            <Link to="/organizador" className="btn-destaque">Voltar para Meus eventos</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <FormularioEvento
            valorInicial={inicial}
            textoBotao="Cadastrar evento"
            aoEnviar={async (dados) => {
              await enviarEvento(dados, usuario)
              setOk(true)
              setTimeout(() => navigate('/organizador'), 1200)
            }}
          />
        </div>
      )}
    </div>
  )
}
