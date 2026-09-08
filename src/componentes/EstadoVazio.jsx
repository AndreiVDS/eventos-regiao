export default function EstadoVazio({ titulo, descricao, acao }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-borda/20 py-14 px-6 text-center">
      <p className="text-4xl" aria-hidden="true">
        🔎
      </p>
      <h3 className="mt-3 text-xl">{titulo}</h3>
      {descricao && <p className="mx-auto mt-1 max-w-md text-suave">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}
