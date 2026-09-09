import { CATEGORIAS, ENTRADAS, FORMATOS, ORDENACOES } from '../lib/formatacao'

const PERIODOS = [
  { valor: 'futuros', rotulo: 'Próximos eventos' },
  { valor: 'semana', rotulo: 'Próximos 7 dias' },
  { valor: 'mes', rotulo: 'Próximos 30 dias' },
  { valor: 'personalizado', rotulo: 'Escolher datas…' },
  { valor: 'encerrados', rotulo: 'Já encerrados' },
  { valor: '', rotulo: 'Qualquer data' },
]

const VAZIO = {
  busca: '',
  cidade: '',
  categoria: '',
  entrada: '',
  formato: '',
  quando: 'futuros',
  de: '',
  ate: '',
  ordenar: 'data',
}

export default function FiltrosEventos({ valores, aoMudar, cidades, temLocalizacao = false }) {
  const set = (campo, valor) => aoMudar({ ...valores, [campo]: valor })

  const usaDatas = valores.quando === 'personalizado' || valores.de || valores.ate

  const temFiltro =
    valores.busca ||
    valores.cidade ||
    valores.categoria ||
    valores.entrada ||
    valores.formato ||
    valores.de ||
    valores.ate ||
    (valores.ordenar && valores.ordenar !== 'data') ||
    (valores.quando && valores.quando !== 'futuros')

  return (
    <form
      className="grid gap-4 rounded-xl bg-superficie p-4 shadow-sm ring-1 ring-borda/10 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={(e) => e.preventDefault()}
      role="search"
      aria-label="Filtrar eventos"
    >
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="rotulo" htmlFor="f-busca">Buscar por nome, local ou cidade</label>
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
        <label className="rotulo" htmlFor="f-cidade">Cidade</label>
        <select id="f-cidade" className="campo" value={valores.cidade} onChange={(e) => set('cidade', e.target.value)}>
          <option value="">Todas as cidades</option>
          {cidades.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nome}/{c.uf}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-categoria">Categoria</label>
        <select id="f-categoria" className="campo" value={valores.categoria} onChange={(e) => set('categoria', e.target.value)}>
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>{c.rotulo}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-entrada">Entrada</label>
        <select id="f-entrada" className="campo" value={valores.entrada} onChange={(e) => set('entrada', e.target.value)}>
          <option value="">Gratuito e pago</option>
          {ENTRADAS.map((e) => (
            <option key={e.valor} value={e.valor}>{e.rotulo}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-formato">Formato</label>
        <select id="f-formato" className="campo" value={valores.formato || ''} onChange={(e) => set('formato', e.target.value)}>
          <option value="">Presencial e online</option>
          {FORMATOS.map((f) => (
            <option key={f.valor} value={f.valor}>{f.rotulo}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-quando">Quando</label>
        <select
          id="f-quando"
          className="campo"
          value={usaDatas ? 'personalizado' : valores.quando}
          onChange={(e) => {
            const v = e.target.value
            aoMudar({ ...valores, quando: v, ...(v === 'personalizado' ? {} : { de: '', ate: '' }) })
          }}
        >
          {PERIODOS.map((p) => (
            <option key={p.valor} value={p.valor}>{p.rotulo}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="rotulo" htmlFor="f-ordenar">Ordenar por</label>
        <select id="f-ordenar" className="campo" value={valores.ordenar || 'data'} onChange={(e) => set('ordenar', e.target.value)}>
          {ORDENACOES.filter((o) => !o.exigeLocalizacao || temLocalizacao).map((o) => (
            <option key={o.valor} value={o.valor}>{o.rotulo}</option>
          ))}
        </select>
      </div>

      {usaDatas && (
        <>
          <div>
            <label className="rotulo" htmlFor="f-de">De</label>
            <input id="f-de" type="date" className="campo" value={valores.de || ''} onChange={(e) => set('de', e.target.value)} />
          </div>
          <div>
            <label className="rotulo" htmlFor="f-ate">Até</label>
            <input id="f-ate" type="date" className="campo" value={valores.ate || ''} onChange={(e) => set('ate', e.target.value)} />
          </div>
        </>
      )}

      {temFiltro && (
        <div className="flex items-end">
          <button
            type="button"
            className="btn-contorno w-full !py-2.5 text-sm"
            onClick={() => aoMudar({ ...VAZIO })}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </form>
  )
}
