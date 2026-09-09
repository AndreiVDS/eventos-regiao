/** Número-destaque com rótulo. Sem gráfico — é só o dado. */
export default function StatTile({ rotulo, valor, sufixo = '', detalhe, tom = 'claro' }) {
  const tons = {
    claro: 'bg-superficie ring-1 ring-borda/10 text-texto',
    escuro: 'bg-tinta text-creme',
    destaque: 'bg-destaque text-tinta',
  }
  return (
    <div className={`rounded-xl p-4 sm:p-5 ${tons[tom]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 sm:text-sm">{rotulo}</p>
      <p className="mt-1 font-titulo text-3xl leading-none tabular-nums sm:text-4xl">
        {valor}
        {sufixo && <span className="text-xl opacity-80 sm:text-2xl">{sufixo}</span>}
      </p>
      {detalhe && <p className="mt-1 text-xs opacity-70 sm:text-sm">{detalhe}</p>}
    </div>
  )
}
