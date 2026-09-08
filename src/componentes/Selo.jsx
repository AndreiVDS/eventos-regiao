export default function Selo({ children, tom = 'neutro' }) {
  const tons = {
    neutro: 'bg-tinta/10 text-tinta',
    destaque: 'bg-destaque text-tinta',
    escuro: 'bg-tinta text-creme',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tons[tom]}`}
    >
      {children}
    </span>
  )
}
