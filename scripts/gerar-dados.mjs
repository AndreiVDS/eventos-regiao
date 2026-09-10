// Gera os artefatos de dados a partir de scripts/dados.mjs.
// Uso: npm run gerar-dados
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { cidades, eventos } from './dados.mjs'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...partes) => resolve(raiz, ...partes)

// Coordenadas do LOCAL de cada evento (curadoria). Um evento também pode trazer
// lat/lng no próprio objeto em dados.mjs — isso tem prioridade.
const coordsEvento = JSON.parse(readFileSync(p('scripts/coordenadas-eventos.json'), 'utf8'))

// ---------- 1. Fundos SVG das cidades ----------
// Sem texto embutido: o nome da cidade é HTML por cima (fica nítido e nunca
// corta). Aqui é só uma arte de fundo: gradiente + malha suave + relevo.
mkdirSync(p('public/img/cidades'), { recursive: true })
function fundoCidade(c) {
  const [a, b] = c.cor
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <radialGradient id="brilho" cx="0.2" cy="0.1" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="pontos" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" opacity="0.07"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#pontos)"/>
  <rect width="1200" height="630" fill="url(#brilho)"/>
  <circle cx="1040" cy="80" r="260" fill="#ffffff" opacity="0.06"/>
  <path d="M0 470 C 220 400 360 520 600 450 C 840 380 980 500 1200 430 L1200 630 L0 630 Z" fill="#000000" opacity="0.16"/>
  <path d="M0 540 C 260 480 380 590 640 520 C 900 450 1020 560 1200 500 L1200 630 L0 630 Z" fill="#000000" opacity="0.12"/>
</svg>`
}
for (const c of cidades) {
  writeFileSync(p('public/img/cidades', `${c.slug}.svg`), fundoCidade(c).trim())
}
// fundo genérico para cidades cadastradas depois (sem cor própria)
writeFileSync(
  p('public/img/cidades/_padrao.svg'),
  fundoCidade({ cor: ['#334155', '#0f172a'] }).trim(),
)

// ---------- 2. cidades.json ----------
const cidadesJson = cidades.map((c) => ({
  slug: c.slug,
  nome: c.nome,
  uf: c.uf,
  regiao: c.regiao,
  descricao: c.descricao,
  lat: c.lat ?? null,
  lng: c.lng ?? null,
  imagem_url: `/img/cidades/${c.slug}.svg`,
  site_prefeitura: c.site_prefeitura,
  aprovada: true,
}))
writeFileSync(p('public/dados/cidades.json'), JSON.stringify(cidadesJson, null, 2) + '\n')

// ---------- 3. Banners SVG para eventos sem foto (imagem_url: 'auto') ----------
// Também sem título embutido — o card já mostra o título em HTML. Aqui é só um
// fundo com a cor da categoria e um símbolo grande de marca d'água.
mkdirSync(p('public/img/eventos'), { recursive: true })
const COR_CAT = {
  cultura: ['#7c3aed', '#3b0764'],
  esporte: ['#0891b2', '#083344'],
  comunitario: ['#e0532f', '#5a1c0e'],
  educacao: ['#2563eb', '#0b2a4a'],
  negocios: ['#0f766e', '#053b36'],
  gastronomia: ['#d97706', '#5a3407'],
}
const GLIFO_CAT = {
  cultura: 'M60 20 L74 48 L104 52 L82 74 L88 104 L60 90 L32 104 L38 74 L16 52 L46 48 Z',
  esporte: 'M60 12 L108 96 L12 96 Z',
  comunitario: 'M60 20 a40 40 0 1 0 0.1 0 M40 55 a12 12 0 1 0 0.1 0 M80 55 a12 12 0 1 0 0.1 0',
  educacao: 'M10 44 L60 20 L110 44 L60 68 Z M28 54 L28 84 Q60 104 92 84 L92 54',
  negocios: 'M20 40 h80 v60 h-80 Z M44 40 v-14 h32 v14',
  gastronomia: 'M60 16 a44 44 0 1 0 0.1 0 M60 34 a26 26 0 1 0 0.1 0',
}
function bannerEvento(e) {
  const [a, b] = COR_CAT[e.categoria] || ['#1f6feb', '#0b2a4a']
  const glifo = GLIFO_CAT[e.categoria] || GLIFO_CAT.comunitario
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <pattern id="pontos" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="1200" height="750" fill="url(#g)"/>
  <rect width="1200" height="750" fill="url(#pontos)"/>
  <circle cx="1010" cy="140" r="300" fill="#ffffff" opacity="0.05"/>
  <g transform="translate(470 195) scale(5)" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="4" stroke-linejoin="round">
    <path d="${glifo}"/>
  </g>
</svg>`
}

// banner genérico usado quando um evento é cadastrado sem imagem
writeFileSync(
  p('public/img/eventos/_padrao.svg'),
  bannerEvento({ categoria: 'comunitario' }).trim(),
)

// Fotos temáticas (Wikimedia Commons, CC) para os eventos de curadoria que não
// têm foto própria. Créditos em /creditos. Chave = id do evento, valor = arquivo
// em public/img/eventos/tema/.
const TEMA_EVENTO = {
  'rock-in-rio-2026': 'show',
  'virada-cultural-sp-2027': 'virada',
  'reveillon-copacabana-2027': 'fogos',
  'natal-luz-gramado-2026': 'natal-luz',
  'natal-curitiba-2026': 'natal-cidade',
  'sao-silvestre-2026': 'corrida',
  'carnaval-olinda-2027': 'carnaval-olinda',
  'festival-parintins-2027': 'parintins',
  'boi-de-mamao-floripa-2026': 'boi-mamao',
  'festa-iemanja-salvador-2027': 'iemanja',
  'lavagem-do-bonfim-2027': 'bonfim',
  'festival-teatro-curitiba-2027': 'teatro',
  'festival-danca-joinville-2027': 'danca',
  'festival-inverno-campos-do-jordao-2027': 'orquestra',
  'feira-do-livro-poa-2026': 'feira-livro',
  'flip-paraty-2027': 'feira-livro',
  'forum-das-letras-ouro-preto-2026': 'feira-livro',
  'acampamento-farroupilha-poa-2026': 'virada',
}

// ---------- 4. eventos.json ----------
const porSlug = Object.fromEntries(cidades.map((c) => [c.slug, c]))
const eventosJson = eventos.map((e, i) => {
  const cidade = porSlug[e.cidade]
  if (!cidade) throw new Error(`Evento "${e.id}" aponta para cidade inexistente: ${e.cidade}`)

  let imagem_url = e.imagem_url
  if (imagem_url === 'auto') {
    if (TEMA_EVENTO[e.id]) {
      imagem_url = `/img/eventos/tema/${TEMA_EVENTO[e.id]}.jpg`
    } else {
      writeFileSync(p('public/img/eventos', `${e.id}.svg`), bannerEvento(e).trim())
      imagem_url = `/img/eventos/${e.id}.svg`
    }
  }

  const par = coordsEvento[e.id]
  const lat = e.lat ?? (Array.isArray(par) ? par[0] : null)
  const lng = e.lng ?? (Array.isArray(par) ? par[1] : null)

  return {
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    descricao_completa: e.descricao_completa ?? null,
    categoria: e.categoria,
    formato: e.formato ?? 'presencial',
    recorrencia: e.recorrencia ?? null,
    destaque: e.destaque === true,
    cidade: e.cidade,
    cidade_nome: cidade.nome,
    uf: cidade.uf,
    local: e.local,
    endereco: e.endereco ?? null,
    lat,
    lng,
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
const q = (s) =>
  s == null
    ? 'null'
    : typeof s === 'number' || typeof s === 'boolean'
      ? String(s)
      : `'${String(s).replace(/'/g, "''")}'`
const colsCidade = ['slug', 'nome', 'uf', 'regiao', 'descricao', 'lat', 'lng', 'imagem_url', 'site_prefeitura', 'aprovada']
const colsEvento = [
  'id', 'titulo', 'descricao', 'descricao_completa', 'categoria', 'formato', 'cidade', 'cidade_nome', 'uf',
  'local', 'endereco', 'lat', 'lng', 'recorrencia', 'data_inicio', 'data_fim', 'horario', 'entrada', 'preco_texto', 'destaque',
  'imagem_url', 'link_oficial', 'organizador_nome', 'status', 'criado_em',
]
let sql = '-- Seed gerado por scripts/gerar-dados.mjs — não edite à mão.\n'
sql += '-- Dados de exemplo (eventos reais e recorrentes; datas ilustrativas).\n\n'
sql += `insert into public.cidades (${colsCidade.join(', ')}) values\n`
sql += cidadesJson.map((c) => '  (' + colsCidade.map((k) => q(c[k])).join(', ') + ')').join(',\n')
// atualiza coordenadas em bases que já tinham as cidades sem lat/lng
sql += '\non conflict (slug) do update set lat = excluded.lat, lng = excluded.lng, aprovada = true;\n\n'
sql += `insert into public.eventos (${colsEvento.join(', ')}) values\n`
sql += eventosJson.map((e) => '  (' + colsEvento.map((k) => q(e[k])).join(', ') + ')').join(',\n')
// atualiza as coordenadas do local em bases que já tinham os eventos
sql +=
  '\non conflict (id) do update set lat = excluded.lat, lng = excluded.lng,' +
  ' imagem_url = excluded.imagem_url, recorrencia = excluded.recorrencia;\n'
writeFileSync(p('supabase/seed.sql'), sql)

// ---------- 5b. supabase/setup.sql (schema + seed num arquivo só) ----------
const schema = readFileSync(p('supabase/schema.sql'), 'utf8')
writeFileSync(
  p('supabase/setup.sql'),
  `-- ============================================================\n` +
    `--  Eventos Região — instalação completa em UMA colagem.\n` +
    `--  Cole tudo isto no SQL Editor do Supabase e execute.\n` +
    `--  (equivale a schema.sql + seed.sql)\n` +
    `-- ============================================================\n\n` +
    schema +
    `\n\n-- =====================  DADOS DE EXEMPLO  =====================\n\n` +
    sql,
)

// ---------- 5c. supabase/coordenadas-eventos.sql (só as coordenadas dos locais) ----------
// Uma única instrução UPDATE ... FROM (VALUES ...) — mais à prova de erro de
// cópia do que 27 UPDATEs soltos.
const linhasCoord = eventosJson
  .filter((e) => e.lat != null && e.lng != null)
  .map((e) => `  ('${e.id}', ${e.lat}, ${e.lng})`)
writeFileSync(
  p('supabase/coordenadas-eventos.sql'),
  '-- Coordenadas do LOCAL de cada evento (distância "perto de mim").\n' +
    '-- Seguro rodar mais de uma vez. Cole INTEIRO no SQL Editor do Supabase.\n\n' +
    'alter table public.eventos add column if not exists lat double precision;\n' +
    'alter table public.eventos add column if not exists lng double precision;\n\n' +
    'update public.eventos as e\n   set lat = c.lat, lng = c.lng\n  from (values\n' +
    linhasCoord.join(',\n') +
    '\n) as c(id, lat, lng)\n where e.id = c.id;\n',
)

// ---------- 5d. supabase/imagens-eventos.sql (sincroniza imagem_url e recorrência) ----------
const sq = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`)
const linhasImg = eventosJson.map((e) => `  ('${e.id}', ${sq(e.imagem_url)}, ${sq(e.recorrencia)})`)
writeFileSync(
  p('supabase/imagens-eventos.sql'),
  '-- Atualiza a imagem e a recorrência dos 27 eventos de exemplo no banco\n' +
    '-- (o seed com "on conflict" antigo não mexia nesses campos).\n' +
    '-- Seguro rodar mais de uma vez. Cole INTEIRO no SQL Editor do Supabase.\n\n' +
    'alter table public.eventos add column if not exists recorrencia text;\n\n' +
    'update public.eventos as e\n   set imagem_url = c.imagem_url, recorrencia = c.recorrencia\n  from (values\n' +
    linhasImg.join(',\n') +
    '\n) as c(id, imagem_url, recorrencia)\n where e.id = c.id;\n',
)

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
