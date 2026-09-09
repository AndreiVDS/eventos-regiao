// Pós-build: gera HTML estático com <title>/meta/OG/JSON-LD por evento e por
// cidade (para o Google e os previews de WhatsApp/Facebook, que não rodam JS),
// além de sitemap.xml e robots.txt.
//
// Roda DEPOIS do `vite build` (precisa de dist/index.html).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...x) => resolve(raiz, ...x)
const SITE = (process.env.VITE_SITE_URL || 'https://eventos-regiao.vercel.app').replace(/\/$/, '')

const template = readFileSync(p('dist/index.html'), 'utf8')
const eventos = JSON.parse(readFileSync(p('public/dados/eventos.json'), 'utf8')).filter(
  (e) => e.status === 'aprovado',
)
const cidades = JSON.parse(readFileSync(p('public/dados/cidades.json'), 'utf8')).filter(
  (c) => c.aprovada !== false,
)

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const raster = (u) => /\.(png|jpe?g|webp)$/i.test(u || '')

/** Substitui a <head> do template pelas tags desta página. */
function paginaHtml({ titulo, descricao, caminho, imagem, jsonLd }) {
  const url = SITE + caminho
  const t = esc(titulo)
  const d = esc(descricao).slice(0, 300)
  const img = imagem || `${SITE}/api/og?t=${encodeURIComponent(titulo)}`

  let head = `
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:site_name" content="Eventos Região" />
    <meta property="og:locale" content="pt_BR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />`
  if (jsonLd) {
    head += `\n    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
  }

  return template
    // remove title, description, canonical e OG/Twitter genéricos do template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta\s+name="description"[\s\S]*?\/>/i, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?\/>/i, '')
    .replace(/<meta\s+property="og:[^"]*"[\s\S]*?\/>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[\s\S]*?\/>/gi, '')
    .replace('</head>', `${head}\n  </head>`)
}

function grava(caminhoRel, html) {
  const arq = p('dist', caminhoRel)
  mkdirSync(dirname(arq), { recursive: true })
  writeFileSync(arq, html)
}

// ---- páginas de evento ----
for (const e of eventos) {
  const imagem = raster(e.imagem_url)
    ? SITE + e.imagem_url
    : `${SITE}/api/og?t=${encodeURIComponent(e.titulo)}&cat=${e.categoria}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.titulo,
    description: e.descricao,
    startDate: e.data_inicio,
    endDate: e.data_fim || e.data_inicio,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode:
      e.formato === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    image: raster(e.imagem_url) ? [SITE + e.imagem_url] : undefined,
    url: `${SITE}/eventos/${e.id}`,
    location:
      e.formato === 'online'
        ? { '@type': 'VirtualLocation', url: e.link_oficial || `${SITE}/eventos/${e.id}` }
        : {
            '@type': 'Place',
            name: e.local,
            address: `${e.endereco || ''}, ${e.cidade_nome}/${e.uf}`.replace(/^, /, ''),
          },
    organizer: e.organizador_nome ? { '@type': 'Organization', name: e.organizador_nome } : undefined,
  }
  grava(
    `eventos/${e.id}.html`,
    paginaHtml({
      titulo: `${e.titulo} · Eventos Região`,
      descricao: e.descricao,
      caminho: `/eventos/${e.id}`,
      imagem,
      jsonLd,
    }),
  )
}

// ---- páginas de cidade ----
for (const c of cidades) {
  grava(
    `cidades/${c.slug}.html`,
    paginaHtml({
      titulo: `Eventos em ${c.nome}/${c.uf} · Eventos Região`,
      descricao: `Agenda de eventos culturais, esportivos e comunitários em ${c.nome}/${c.uf}. ${c.descricao || ''}`.trim(),
      caminho: `/cidades/${c.slug}`,
    }),
  )
}

// ---- páginas fixas ----
grava(
  'eventos.html',
  paginaHtml({
    titulo: 'Agenda de eventos · Eventos Região',
    descricao:
      'Busque e filtre eventos culturais, esportivos e comunitários por cidade, categoria, data e tipo de entrada.',
    caminho: '/eventos',
  }),
)
grava(
  'cidades.html',
  paginaHtml({
    titulo: 'Cidades participantes · Eventos Região',
    descricao: 'Conheça a identidade cultural de cada cidade e a agenda de eventos de cada uma.',
    caminho: '/cidades',
  }),
)
grava(
  'sobre.html',
  paginaHtml({
    titulo: 'Sobre o projeto · Eventos Região',
    descricao:
      'Plataforma inclusiva para o turismo e a cultura local, da Atividade Extensionista de Engenharia de Software da UNINTER.',
    caminho: '/sobre',
  }),
)

// ---- sitemap.xml ----
const hoje = new Date().toISOString().slice(0, 10)
const urls = [
  { loc: '/', pri: '1.0' },
  { loc: '/eventos', pri: '0.9' },
  { loc: '/cidades', pri: '0.7' },
  { loc: '/sobre', pri: '0.4' },
  { loc: '/privacidade', pri: '0.2' },
  ...eventos.map((e) => ({ loc: `/eventos/${e.id}`, pri: '0.8' })),
  ...cidades.map((c) => ({ loc: `/cidades/${c.slug}`, pri: '0.6' })),
]
writeFileSync(
  p('dist/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${SITE}${u.loc}</loc><lastmod>${hoje}</lastmod><priority>${u.pri}</priority></url>`,
      )
      .join('\n') +
    `\n</urlset>\n`,
)

writeFileSync(
  p('dist/robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
)

console.log(
  `SEO — ${eventos.length} eventos, ${cidades.length} cidades, sitemap com ${urls.length} URLs.`,
)
