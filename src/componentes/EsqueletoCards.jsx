/** Placeholder animado enquanto a lista de eventos carrega. */
export default function EsqueletoCards({ quantidade = 6 }) {
  return (
    <div
      className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="cartao overflow-hidden">
          <div className="esqueleto h-44 rounded-none" />
          <div className="space-y-3 p-4">
            <div className="esqueleto h-4 w-2/3" />
            <div className="esqueleto h-4 w-full" />
            <div className="esqueleto h-4 w-1/2" />
            <div className="esqueleto h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
