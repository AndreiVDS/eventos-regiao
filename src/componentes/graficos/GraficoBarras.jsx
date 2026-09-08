/**
 * Gráfico de barras horizontais para MAGNITUDE (contagens).
 * Uma única cor (sequência de uma matiz) — identidade vem do rótulo, não da cor.
 * Traz rótulos diretos e uma tabela equivalente para leitores de tela.
 */
export default function GraficoBarras({ titulo, dados, unidade = '', vazio = 'Sem dados.' }) {
  const max = Math.max(1, ...dados.map((d) => d.valor))
  const temAlgum = dados.some((d) => d.valor > 0)

  return (
    <figure className="rounded-xl bg-superficie p-5 shadow-sm ring-1 ring-borda/10">
      <figcaption className="mb-4 font-titulo text-xl tracking-wide">{titulo}</figcaption>

      {!temAlgum ? (
        <p className="py-6 text-center text-sm text-suave">{vazio}</p>
      ) : (
        <ul className="space-y-2.5">
          {dados.map((d) => (
            <li key={d.chave ?? d.rotulo} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2">
              <span className="truncate text-sm text-suave" title={d.rotulo}>
                {d.rotulo}
              </span>
              <span className="h-4 rounded bg-texto/10" aria-hidden="true">
                <span
                  className="block h-4 rounded bg-destaque transition-[width] duration-500"
                  style={{ width: `${Math.max((d.valor / max) * 100, d.valor > 0 ? 4 : 0)}%` }}
                  title={`${d.rotulo}: ${d.valor}${unidade ? ' ' + unidade : ''}`}
                />
              </span>
              <span className="text-right text-sm font-semibold tabular-nums">{d.valor}</span>
            </li>
          ))}
        </ul>
      )}

      <details className="mt-4 text-sm text-suave">
        <summary className="cursor-pointer">Ver dados em tabela</summary>
        <table className="mt-2 w-full border-collapse">
          <thead>
            <tr className="border-b border-borda/15 text-left">
              <th className="py-1 pr-2 font-semibold">Item</th>
              <th className="py-1 font-semibold">{unidade || 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => (
              <tr key={(d.chave ?? d.rotulo) + '-t'} className="border-b border-borda/10">
                <td className="py-1 pr-2">{d.rotulo}</td>
                <td className="py-1 tabular-nums">{d.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
