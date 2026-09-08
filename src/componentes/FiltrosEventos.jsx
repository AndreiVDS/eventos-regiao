import { CATEGORIAS, ENTRADAS } from '../lib/formatacao'

const PERIODOS = [
  { valor: 'futuros', rotulo: 'Próximos eventos' },
  { valor: 'semana', rotulo: 'Próximos 7 dias' },
  { valor: 'mes', rotulo: 'Próximos 30 dias' },
  { valor: '', rotulo: 'Qualquer data' },
]

export default function FiltrosEventos({ valores, aoMudar, cidades }) {
  function set(campo, valor) {
    aoMudar({ ...valores, [campo]: valor })
  }

  const temFiltro =
    valores.busca ||
    valores.cidade ||
    valores.categoria ||
    valores.entrada ||
    (valores.quando && valores.quando !== 'futuros')

  return (
    <form
      className="grid gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-tinta/10 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={(e) => e.preventDefault()}
      role="search"
      aria-label="Filtrar eventos"
    >
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="rotulo" htmlFor="f-busca">
          Buscar por nome, local ou cidade
        </label>
        <input
          id="f-busca"
          type="search"
          className="campo"
          placeholder="Ex.: festival, corrida, Blumenau…"
          value={valores.busca}
          onChange={(e) => set('busca', e.target.value)}
        />
      </div>

      <div>
        <label className="rotulo" htmlFor="f-cidade">
          Cidade
        </label>
        <select
          id="f-cidade"
          className="campo"
          value={valores.cidade}
          onChange={(e) => set('cidade', e.target.value)}
        >
          <option value="">Todas as cidades</option>
          {cidades.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nome}/{c.uf}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-categoria">
          Categoria
        </label>
        <select
          id="f-categoria"
          className="campo"
          value={valores.categoria}
          onChange={(e) => set('categoria', e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.rotulo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-entrada">
          Entrada
        </label>
        <select
          id="f-entrada"
          className="campo"
          value={valores.entrada}
          onChange={(e) => set('entrada', e.target.value)}
        >
          <option value="">Gratuito e pago</option>
          {ENTRADAS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.rotulo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-quando">
          Quando
        </label>
        <select
          id="f-quando"
          className="campo"
          value={valores.quando}
          onChange={(e) => set('quando', e.target.value)}
        >
          {PERIODOS.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.rotulo}
            </option>
          ))}
        </select>
      </div>

      {temFiltro && (
        <div className="flex items-end">
          <button
            type="button"
            className="btn-contorno w-full !py-2.5 text-sm"
            onClick={() =>
              aoMudar({ busca: '', cidade: '', categoria: '', entrada: '', quando: 'futuros' })
            }
          >
            Limpar filtros
          </button>
        </div>
      )}
    </form>
  )
}
