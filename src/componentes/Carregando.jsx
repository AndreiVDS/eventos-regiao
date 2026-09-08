export default function Carregando({ texto = 'Carregando…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-tinta/60" role="status">
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-tinta/30 border-t-tinta"
        aria-hidden="true"
      />
      <span>{texto}</span>
    </div>
  )
}
