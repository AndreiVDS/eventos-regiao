import { AbasPainel } from './Painel'
import Carregando from '../../componentes/Carregando'
import EstadoVazio from '../../componentes/EstadoVazio'
import { listarContatos } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'

const fmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export default function Mensagens() {
  const { dados: contatos, carregando } = useAsync(() => listarContatos(), [])

  return (
    <div className="container-pagina py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-suave/80">Painel da equipe</p>
      <h1 className="text-4xl">Mensagens</h1>
      <div className="mt-4">
        <AbasPainel />
      </div>

      {carregando ? (
        <Carregando texto="Carregando mensagens…" />
      ) : !contatos || contatos.length === 0 ? (
        <div className="mt-8">
          <EstadoVazio titulo="Nenhuma mensagem" descricao="Os contatos enviados pela página /contato aparecem aqui." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {contatos.map((c, i) => (
            <li key={c.id || i} className="rounded-xl bg-superficie p-4 shadow-suave ring-1 ring-borda/10">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{c.assunto || '(sem assunto)'}</p>
                <span className="text-xs text-suave">{c.criado_em ? fmt.format(new Date(c.criado_em)) : ''}</span>
              </div>
              <p className="mt-0.5 text-sm text-suave">
                {c.nome} —{' '}
                <a href={`mailto:${c.email}`} className="underline">{c.email}</a>
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-texto">{c.mensagem}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
