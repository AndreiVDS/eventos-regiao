// Baixa a lista de municípios do IBGE (oficial, grátis) e grava um JSON compacto
// em public/dados/municipios.json:  { "SC": ["Abdon Batista", ...], ... }
//
// Uso: node scripts/gerar-municipios.mjs   (roda uma vez; o resultado é commitado)
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const out = {}
for (const uf of UFS) {
  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`IBGE ${uf}: HTTP ${r.status}`)
  const lista = await r.json()
  out[uf] = lista.map((m) => m.nome)
  process.stdout.write(`${uf}:${out[uf].length}  `)
}

const total = Object.values(out).reduce((a, l) => a + l.length, 0)
writeFileSync(
  resolve(raiz, 'public/dados/municipios.json'),
  JSON.stringify(out) + '\n',
)
console.log(`\nOK — ${total} municípios em public/dados/municipios.json`)
