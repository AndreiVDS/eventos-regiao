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

  const pendente = (pedidos || []).find((p) => p.status === 'solicitado')
  if (pendente) {
    return (
      <span className="text-sm text-suave">
        ✨ Destaque solicitado ({pendente.dias} dias) — aguardando confirmação de pagamento
      </span>
    )
  }

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await solicitarDestaque({ evento_id: evento.id, dias, observacao: obs }, usuario)
      setAberto(false)
      recarregar?.()
    } finally {
      setEnviando(false)
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        className="text-sm font-semibold text-texto underline hover:text-suave"
        onClick={() => setAberto(true)}
      >
        ✨ Destacar este evento
      </button>
    )
  }

  return (
    <form onSubmit={enviar} className="mt-2 w-full rounded-lg bg-texto/5 p-3 text-sm">
      <p className="text-suave">
        O evento em destaque aparece <strong>no carrossel da home e no topo da lista</strong>, com o
        selo “Patrocinado”. Pagamento via <strong>Pix</strong> para a chave{' '}
        <code className="rounded bg-texto/10 px-1">{CHAVE_PIX}</code>. Depois de pagar, envie o
        comprovante pela página <a href="/contato" className="underline">Contato</a> — a equipe
        confirma e ativa o destaque.
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-suave">
          Período
          <select
            className="campo mt-1 !py-1.5 text-sm"
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
      </div>
      <textarea
        className="campo mt-2 !py-1.5 text-sm"
        rows="2"
        placeholder="Observação (opcional): data preferida, forma de pagamento…"
        value={obs}
        onChange={(e) => setObs(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="btn-destaque !py-1.5 text-sm" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Solicitar destaque'}
        </button>
        <button type="button" className="btn-fantasma !py-1.5 text-sm" onClick={() => setAberto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
