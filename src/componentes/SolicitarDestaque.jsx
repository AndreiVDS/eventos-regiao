import { useState } from 'react'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../lib/auth'
import { solicitarDestaque, pedidosDoEvento, ehPatrocinado, VALOR_DESTAQUE } from '../lib/api'

const CHAVE_PIX = 'andreivini31@gmail.com' // chave Pix da equipe (ilustrativa)

export default function SolicitarDestaque({ evento }) {
  const { usuario } = useAuth()
  const { dados: pedidos, recarregar } = useAsync(() => pedidosDoEvento(evento.id), [evento.id])
  const [aberto, setAberto] = useState(false)
  const [dias, setDias] = useState(7)
  const [obs, setObs] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (ehPatrocinado(evento)) {
    return <span className="text-sm font-semibold text-destaque">✨ Em destaque (patrocinado)</span>
  }

  const lista = pedidos || []
  const pendente = lista.find((p) => p.status === 'solicitado')
  if (pendente) {
    return (
      <span className="text-sm text-suave">
        ✨ Destaque solicitado ({pendente.dias} dias) — aguardando a equipe confirmar o pagamento
      </span>
    )
  }
  const recusadoAntes = !aberto && lista.some((p) => p.status === 'recusado')

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await solicitarDestaque({ evento_id: evento.id, dias, observacao: obs }, usuario)
      setAberto(false)
      setObs('')
      recarregar?.()
    } finally {
      setEnviando(false)
    }
  }

  if (!aberto) {
    return (
      <div className="text-sm">
        {recusadoAntes && (
          <p className="mb-1 text-suave">Seu pedido anterior foi recusado.</p>
        )}
        <button
          type="button"
          className="font-semibold text-texto underline hover:text-suave"
          onClick={() => setAberto(true)}
        >
          ✨ {recusadoAntes ? 'Solicitar destaque de novo' : 'Destacar este evento'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="mt-2 w-full space-y-3 rounded-lg bg-texto/5 p-4 text-sm">
      <p className="text-suave">
        O evento em destaque aparece <strong>no carrossel da home e no topo da lista</strong>, com o
        selo “Patrocinado”.
      </p>
      <p className="text-suave">
        Pagamento por <strong>Pix</strong>. Chave:
        <br />
        <code className="mt-1 inline-block break-all rounded bg-texto/10 px-1.5 py-0.5">
          {CHAVE_PIX}
        </code>
      </p>
      <p className="text-suave">
        Depois de pagar, envie o comprovante pela página{' '}
        <a href="/contato" className="underline">Contato</a>. A equipe confirma e ativa o destaque.
      </p>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-suave">Período</span>
        <select
          className="campo !py-2"
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
        >
          {Object.entries(VALOR_DESTAQUE).map(([d, v]) => (
            <option key={d} value={d}>
              {d} dias — R$ {v}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-suave">Observação (opcional)</span>
        <textarea
          className="campo !py-2"
          rows="3"
          placeholder="Data preferida, forma de pagamento…"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-destaque !py-2 text-sm" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Solicitar destaque'}
        </button>
        <button type="button" className="btn-fantasma !py-2 text-sm" onClick={() => setAberto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
