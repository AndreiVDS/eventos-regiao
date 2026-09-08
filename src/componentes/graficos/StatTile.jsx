/** Número-destaque com rótulo. Sem gráfico — é só o dado. */
export default function StatTile({ rotulo, valor, sufixo = '', detalhe, tom = 'claro' }) {
  const tons = {
    claro: 'bg-white ring-1 ring-tinta/10 text-tinta',
    escuro: 'bg-tinta text-creme',
    destaque: 'bg-destaque text-tinta',
  }
  return (
    <div className={`rounded-xl p-5 ${tons[tom]}`}>
      <p className="text-sm font-semibold uppercase tracking-wide opacity-70">{rotulo}</p>
      <p className="mt-1 font-titulo text-4xl leading-none tabular-nums">
        {valor}
        {sufixo && <span className="text-2xl opacity-80">{sufixo}</span>}
      </p>
      {detalhe && <p className="mt-1 text-sm opacity-70">{detalhe}</p>}
    </div>
  )
}
