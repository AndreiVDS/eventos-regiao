import { useEffect, useState } from 'react'
import { AbasPainel } from './Painel'
import Selo from '../../componentes/Selo'
import { listarCidades, criarCidade, aprovarCidade } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { UFS, municipiosDoEstado } from '../../lib/municipios'

const VAZIO = { nome: '', uf: '', regiao: '', descricao: '', site_prefeitura: '' }

export default function NovaCidade() {
  const { dados: cidades, recarregar } = useAsync(() => listarCidades({ todas: true }), [])
  const [form, setForm] = useState(VAZIO)
  const [msg, setMsg] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [municipios, setMunicipios] = useState([])

  const campo = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    let ativo = true
    if (!form.uf) return setMunicipios([])
    municipiosDoEstado(form.uf).then((l) => ativo && setMunicipios(l)).catch(() => {})
    return () => { ativo = false }
  }, [form.uf])

  async function enviar(e) {
    e.preventDefault()
    setMsg(null)
    if (!form.nome.trim() || form.uf.length !== 2) {
      setMsg({ tom: 'erro', texto: 'Informe o nome e o estado (UF).' })
      return
    }
    setSalvando(true)
    try {
      const c = await criarCidade(form, { aprovada: true })
      setMsg({ tom: 'ok', texto: `${c.nome}/${c.uf} cadastrada e publicada.` })
      setForm(VAZIO)
      recarregar?.()
    } catch (err) {
      setMsg({ tom: 'erro', texto: err.message || 'Não deu para cadastrar a cidade.' })
    } finally {
      setSalvando(false)
    }
  }

  async function publicar(slug) {
    await aprovarCidade(slug)
    recarregar?.()
  }

  const pendentes = (cidades || []).filter((c) => c.aprovada === false)
  const publicadas = (cidades || []).filter((c) => c.aprovada !== false)

  return (
    <div className="container-pagina py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-suave/80">Painel da equipe</p>
      <h1 className="text-4xl">Cidades</h1>
      <div className="mt-4">
        <AbasPainel />
      </div>

      {pendentes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl">Sugeridas por organizadores</h2>
          <p className="mt-1 text-sm text-suave">
            Entram no site ao aprovar o evento que as trouxe — ou publique aqui direto.
          </p>
          <ul className="mt-4 divide-y divide-borda/10 overflow-hidden rounded-xl bg-superficie ring-1 ring-borda/10">
            {pendentes.map((c) => (
              <li key={c.slug} className="flex flex-wrap items-center gap-3 p-3">
                <span className="flex-1 font-semibold">
                  {c.nome} <span className="text-suave">/{c.uf}</span>
                </span>
                <Selo tom="neutro">pendente</Selo>
                <button className="btn-destaque !py-1.5 text-sm" onClick={() => publicar(c.slug)}>
                  Publicar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={enviar} className="cartao space-y-4 p-5">
          <h2 className="text-2xl">Cadastrar cidade</h2>
          {msg && (
            <p
              className={`rounded-lg p-2 text-sm ${
                msg.tom === 'erro'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                  : 'bg-destaque/15 text-texto'
              }`}
              role="status"
            >
              {msg.texto}
            </p>
          )}
          <div>
            <label className="rotulo" htmlFor="nc-uf">Estado</label>
            <select
              id="nc-uf"
              className="campo"
              value={form.uf}
              onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value, nome: '' }))}
            >
              <option value="">Selecione…</option>
              {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="rotulo" htmlFor="nc-nome">Município</label>
            <select
              id="nc-nome"
              className="campo"
              value={form.nome}
              disabled={!form.uf || municipios.length === 0}
              onChange={(e) => campo('nome', e.target.value)}
            >
              <option value="">
                {!form.uf ? '—' : municipios.length === 0 ? 'Carregando…' : 'Selecione…'}
              </option>
              {municipios.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="rotulo" htmlFor="nc-regiao">Região <span className="text-suave">(opcional)</span></label>
            <input id="nc-regiao" className="campo" placeholder="Ex.: Vale do Itajaí" value={form.regiao}
              onChange={(e) => campo('regiao', e.target.value)} />
          </div>
          <div>
            <label className="rotulo" htmlFor="nc-desc">Descrição <span className="text-suave">(opcional)</span></label>
            <textarea id="nc-desc" rows="3" className="campo" value={form.descricao}
              onChange={(e) => campo('descricao', e.target.value)} />
          </div>
          <div>
            <label className="rotulo" htmlFor="nc-site">Site da prefeitura <span className="text-suave">(opcional)</span></label>
            <input id="nc-site" type="url" className="campo" placeholder="https://" value={form.site_prefeitura}
              onChange={(e) => campo('site_prefeitura', e.target.value)} />
          </div>
          <button type="submit" className="btn-destaque w-full sm:w-auto" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Cadastrar e publicar'}
          </button>
        </form>

        <div>
          <h2 className="text-2xl">No ar ({publicadas.length})</h2>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {publicadas.map((c) => (
              <li key={c.slug} className="rounded-lg bg-superficie px-3 py-2 ring-1 ring-borda/10">
                {c.nome} <span className="text-suave">/{c.uf}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
