import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormularioEvento, { EVENTO_VAZIO } from '../componentes/FormularioEvento'
import { enviarEvento } from '../lib/api'
import { supabaseConfigurado } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function DivulgueSeuEvento() {
  const { usuario, autenticado } = useAuth()
  const [enviado, setEnviado] = useState(false)

  const inicial = usuario?.email
    ? { ...EVENTO_VAZIO, organizador_contato: usuario.email }
    : EVENTO_VAZIO

  if (enviado) {
    return (
      <div className="container-pagina py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-superficie p-8 text-center shadow-sm ring-1 ring-borda/10">
          <p className="text-5xl" aria-hidden="true">✅</p>
          <h1 className="mt-4 text-3xl">Evento enviado!</h1>
          <p className="mt-2 text-suave">
            Recebemos sua proposta. A equipe vai revisar as informações e, uma vez aprovado, o
            evento aparece na agenda pública.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-contorno" onClick={() => setEnviado(false)}>Enviar outro</button>
            {autenticado ? (
              <Link to="/organizador" className="btn-destaque">Ver em Meus eventos</Link>
            ) : (
              <Link to="/eventos" className="btn-destaque">Ver a agenda</Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Divulgue seu evento</h1>
      <p className="mt-1 max-w-2xl text-suave">
        Grandes ou pequenos, todos os eventos que fortalecem a cultura e a economia local podem ser
        cadastrados aqui. O envio é gratuito e passa por uma revisão antes de ser publicado.
      </p>

      {!autenticado && (
        <p className="mt-4 rounded-lg bg-texto/5 p-3 text-sm">
          Dica: <Link to="/entrar" className="font-semibold underline">crie uma conta de organizador</Link>{' '}
          para acompanhar o status dos seus eventos e ver métricas.
        </p>
      )}

      {!supabaseConfigurado && (
        <p className="mt-4 rounded-lg border-l-4 border-destaque bg-destaque/10 p-3 text-sm text-texto">
          <strong>Modo demonstração:</strong> o banco de dados ainda não está conectado, então o
          envio fica salvo apenas neste navegador. Configure o Supabase (veja o README) para receber
          os envios de verdade.
        </p>
      )}

      <div className="mt-8">
        <FormularioEvento
          valorInicial={inicial}
          aoEnviar={async (dados) => {
            await enviarEvento(dados, usuario)
            setEnviado(true)
          }}
        />
      </div>
    </div>
  )
}
