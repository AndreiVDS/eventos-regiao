import { useState } from 'react'
import { AbasPainel } from './Painel'
import Carregando from '../../componentes/Carregando'
import EstadoVazio from '../../componentes/EstadoVazio'
import Selo from '../../componentes/Selo'
import { listarPedidosDestaque, resolverPedidoDestaque, VALOR_DESTAQUE } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'

const fmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
const TOM = { solicitado: 'neutro', pago: 'destaque', recusado: 'escuro' }
const ROTULO = { solicitado: 'Solicitado', pago: 'Pago — em destaque', recusado: 'Recusado' }

export default function Patrocinios() {
  const { dados: pedidos, carregando, recarregar } = useAsync(() => listarPedidosDestaque(), [])
  const [msg, setMsg] = useState(null)
  const [ocupado, setOcupado] = useState(null)

  async function resolver(pedido, status) {
    setOcupado(pedido.id)
    setMsg(null)
    try {
      await resolverPedidoDestaque(pedido, status)
      setMsg(
        status === 'pago'
          ? '✓ Pagamento confirmado — o evento entrou no destaque.'
          : 'Pedido recusado.',
      )
      recarregar?.()
    } catch (e) {
      setMsg(`Não deu para salvar: ${e.message || 'tente de novo.'}`)
    } finally {
      setOcupado(null)
    }
  }

  const nome = (p) => p.eventos?.titulo || p.evento_id
  const lista = pedidos || []
  const abertos = lista.filter((p) => p.status === 'solicitado')
  const resolvidos = lista.filter((p) => p.status !== 'solicitado')

  const Cartao = ({ p }) => (
    <li className="rounded-xl bg-superficie p-4 shadow-suave ring-1 ring-borda/10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{nome(p)}</p>
        <Selo tom={TOM[p.status]}>{ROTULO[p.status]}</Selo>
      </div>
      <p className="mt-0.5 text-sm text-suave">
        {p.dias} dias · R$ {VALOR_DESTAQUE[p.dias] ?? '—'} ·{' '}
        {p.criado_em ? fmt.format(new Date(p.criado_em)) : ''}
      </p>
      {p.observacao && <p className="mt-1 text-sm text-texto">“{p.observacao}”</p>}
      {p.status === 'solicitado' && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            className="btn-destaque !py-1.5 text-sm"
            disabled={ocupado === p.id}
            onClick={() => resolver(p, 'pago')}
          >
            Confirmar pagamento
          </button>
          <button
            className="btn-contorno !py-1.5 text-sm"
            disabled={ocupado === p.id}
            onClick={() => resolver(p, 'recusado')}
          >
            Recusar
          </button>
        </div>
      )}
    </li>
  )

  return (
    <div className="container-pagina py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-suave/80">Painel da equipe</p>
      <h1 className="text-4xl">Patrocínios</h1>
      <p className="mt-1 text-sm text-suave">
        Pedidos de destaque pago. Ao confirmar o pagamento, o evento entra no carrossel com o selo
        “Patrocinado”.
      </p>
      <div className="mt-4">
        <AbasPainel />
      </div>

      {msg && (
        <p className="mt-4 rounded-lg bg-destaque/15 p-2 text-sm text-texto" role="status">
          {msg}
        </p>
      )}

      {carregando ? (
        <Carregando texto="Carregando pedidos…" />
      ) : lista.length === 0 ? (
        <div className="mt-8">
          <EstadoVazio
            titulo="Nenhum pedido"
            descricao="Os pedidos feitos pelos organizadores em “Meus eventos” aparecem aqui."
          />
        </div>
      ) : (
        <>
          <h2 className="mt-8 text-xl">
            Aguardando {abertos.length > 0 && `(${abertos.length})`}
          </h2>
          {abertos.length === 0 ? (
            <p className="mt-2 text-sm text-suave">Nada pendente.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {abertos.map((p) => (
                <Cartao key={p.id} p={p} />
              ))}
            </ul>
          )}

          {resolvidos.length > 0 && (
            <>
              <h2 className="mt-8 text-xl">Histórico</h2>
              <ul className="mt-3 space-y-3 opacity-80">
                {resolvidos.map((p) => (
                  <Cartao key={p.id} p={p} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}
