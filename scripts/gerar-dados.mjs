// Gera os artefatos de dados a partir de scripts/dados.mjs.
// Uso: npm run gerar-dados
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { cidades, eventos } from './dados.mjs'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...partes) => resolve(raiz, ...partes)

// ---------- 1. Postais SVG das cidades ----------
mkdirSync(p('public/img/cidades'), { recursive: true })
for (const c of cidades) {
  const [a, b] = c.cor
  const regiao = c.regiao.length > 34 ? c.uf : `${c.uf} · ${c.regiao.toUpperCase()}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500" viewBox="0 0 1200 500" font-family="Bebas Neue, Arial, sans-serif">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="1200" height="500" fill="url(#g)"/>
  <g fill="#ffffff" opacity="0.09"><circle cx="1000" cy="90" r="210"/><circle cx="120" cy="470" r="170"/></g>
  <path d="M0 360 L200 280 L400 350 L600 260 L800 340 L1000 250 L1200 330 L1200 500 L0 500 Z" fill="#000" opacity="0.2"/>
  <text x="80" y="250" fill="#fff" font-size="120" letter-spacing="3">${c.nome.toUpperCase()}</text>
  <text x="86" y="310" fill="#f4b400" font-size="40" letter-spacing="5">${regiao}</text>
</svg>`
  writeFileSync(p('public/img/cidades', `${c.slug}.svg`), svg.trim())
}

// ---------- 2. cidades.json ----------
const cidadesJson = cidades.map((c) => ({
  slug: c.slug,
  nome: c.nome,
  uf: c.uf,
  regiao: c.regiao,
  descricao: c.descricao,
  imagem_url: `/img/cidades/${c.slug}.svg`,
  site_prefeitura: c.site_prefeitura,
}))
writeFileSync(p('public/dados/cidades.json'), JSON.stringify(cidadesJson, null, 2) + '\n')

// ---------- 3. Banners SVG para eventos sem foto (imagem_url: 'auto') ----------
mkdirSync(p('public/img/eventos'), { recursive: true })
const EMOJI_CAT = {
  cultura: '♪', esporte: '▲', comunitario: '✦', educacao: '❖', negocios: '◆', gastronomia: '✺',
}
function bannerEvento(e, cidade) {
  const [a, b] = cidade.cor
  // quebra o título em até 2 linhas (~22 caracteres por linha)
  const linhas = ['', '']
  for (const w of e.titulo.split(' ')) {
    const i = linhas[1] || (linhas[0].length && (linhas[0] + ' ' + w).length > 22) ? 1 : 0
    linhas[i] = (linhas[i] ? linhas[i] + ' ' : '') + w
  }
  if (linhas[1].length > 26) linhas[1] = linhas[1].slice(0, 24) + '…'
  const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" font-family="Bebas Neue, Arial, sans-serif">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="1200" height="750" fill="url(#g)"/>
  <g fill="#ffffff" opacity="0.08"><circle cx="1030" cy="120" r="260"/><circle cx="140" cy="700" r="200"/></g>
  <text x="70" y="150" fill="#f4b400" font-size="120" opacity="0.9">${EMOJI_CAT[e.categoria] || '★'}</text>
  <text x="70" y="380" fill="#ffffff" font-size="80" letter-spacing="1">${esc(linhas[0].toUpperCase())}</text>
  <text x="70" y="470" fill="#ffffff" font-size="80" letter-spacing="1">${esc(linhas[1].toUpperCase())}</text>
  <text x="74" y="620" fill="#f4b400" font-size="42" letter-spacing="4">${esc(cidade.nome.toUpperCase())} · ${cidade.uf}</text>
  <text x="74" y="680" fill="#ffffff" opacity="0.7" font-size="30" letter-spacing="3">EVENTOS REGIÃO</text>
</svg>`
}

// banner genérico usado quando um evento é cadastrado sem imagem
writeFileSync(
  p('public/img/eventos/_padrao.svg'),
  bannerEvento(
    { titulo: 'Evento na sua região', categoria: 'comunitario' },
    { cor: ['#1f6feb', '#0b2a4a'], nome: 'Eventos Região', uf: 'BR' },
  ).trim(),
)

// ---------- 4. eventos.json ----------
const porSlug = Object.fromEntries(cidades.map((c) => [c.slug, c]))
const eventosJson = eventos.map((e, i) => {
  const cidade = porSlug[e.cidade]
  if (!cidade) throw new Error(`Evento "${e.id}" aponta para cidade inexistente: ${e.cidade}`)

  let imagem_url = e.imagem_url
  if (imagem_url === 'auto') {
    writeFileSync(p('public/img/eventos', `${e.id}.svg`), bannerEvento(e, cidade).trim())
    imagem_url = `/img/eventos/${e.id}.svg`
  }

  return {
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    descricao_completa: e.descricao_completa ?? null,
    categoria: e.categoria,
    cidade: e.cidade,
    cidade_nome: cidade.nome,
    uf: cidade.uf,
    local: e.local,
    endereco: e.endereco ?? null,
    data_inicio: e.data_inicio,
    data_fim: e.data_fim ?? null,
    horario: e.horario ?? null,
    entrada: e.entrada,
    preco_texto: e.preco_texto ?? null,
    imagem_url,
    link_oficial: e.link_oficial ?? null,
    organizador_nome: e.organizador_nome,
    status: e.status ?? 'aprovado',
    criado_em: e.criado_em ?? `2026-08-${String((i % 27) + 1).padStart(2, '0')}T12:00:00.000Z`,
  }
})
writeFileSync(p('public/dados/eventos.json'), JSON.stringify(eventosJson, null, 2) + '\n')

// ---------- 5. supabase/seed.sql ----------
const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`)
const colsCidade = ['slug', 'nome', 'uf', 'regiao', 'descricao', 'imagem_url', 'site_prefeitura']
const colsEvento = [
  'id', 'titulo', 'descricao', 'descricao_completa', 'categoria', 'cidade', 'cidade_nome', 'uf',
  'local', 'endereco', 'data_inicio', 'data_fim', 'horario', 'entrada', 'preco_texto',
  'imagem_url', 'link_oficial', 'organizador_nome', 'status', 'criado_em',
]
let sql = '-- Seed gerado por scripts/gerar-dados.mjs — não edite à mão.\n'
sql += '-- Dados de exemplo (eventos reais e recorrentes; datas ilustrativas).\n\n'
sql += `insert into public.cidades (${colsCidade.join(', ')}) values\n`
sql += cidadesJson.map((c) => '  (' + colsCidade.map((k) => q(c[k])).join(', ') + ')').join(',\n')
sql += '\non conflict (slug) do nothing;\n\n'
sql += `insert into public.eventos (${colsEvento.join(', ')}) values\n`
sql += eventosJson.map((e) => '  (' + colsEvento.map((k) => q(e[k])).join(', ') + ')').join(',\n')
sql += '\non conflict (id) do nothing;\n'
writeFileSync(p('supabase/seed.sql'), sql)

// ---------- 6. api/_dados.json (snapshot para a API serverless) ----------
mkdirSync(p('api'), { recursive: true })
writeFileSync(
  p('api/_dados.json'),
  JSON.stringify(
    { cidades: cidadesJson, eventos: eventosJson.filter((e) => e.status === 'aprovado') },
    null,
    2,
  ) + '\n',
)

console.log(
  `OK — ${cidadesJson.length} cidades, ${eventosJson.length} eventos.\n` +
    'Gerados: public/dados/*.json, supabase/seed.sql, public/img/cidades/*.svg',
)
