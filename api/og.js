import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

const COR_CAT = {
  cultura: '#7c3aed',
  esporte: '#0891b2',
  comunitario: '#e0532f',
  educacao: '#2563eb',
  negocios: '#0f766e',
  gastronomia: '#d97706',
}

// elemento no formato que o satori entende, sem precisar de JSX
const h = (type, props, children) => ({ type, props: { ...props, children } })

export default function handler(req) {
  const { searchParams } = new URL(req.url)
  const titulo = (searchParams.get('t') || 'Eventos Região').slice(0, 110)
  const linha = (searchParams.get('l') || 'Turismo e cultura da sua região').slice(0, 90)
  const cat = (searchParams.get('cat') || '').toLowerCase()
  const cor = COR_CAT[cat] || '#f4b400'

  const arvore = h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '70px',
        backgroundColor: '#1f1e1f',
        backgroundImage: `radial-gradient(1000px 500px at 12% -10%, ${cor}55, transparent 60%)`,
        color: '#faf9f7',
        fontFamily: 'sans-serif',
      },
    },
    [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } }, [
        h('div', {
          style: { width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f4b400' },
        }),
        h('div', { style: { fontSize: '30px', letterSpacing: '2px', fontWeight: 700 } }, 'EVENTOS REGIÃO'),
      ]),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '18px' } }, [
        h('div', { style: { fontSize: '64px', fontWeight: 800, lineHeight: 1.05 } }, titulo),
        h('div', { style: { fontSize: '32px', color: '#c9c7c3' } }, linha),
      ]),
      h(
        'div',
        {
          style: {
            fontSize: '26px',
            color: '#1f1e1f',
            backgroundColor: '#f4b400',
            alignSelf: 'flex-start',
            padding: '10px 22px',
            borderRadius: '999px',
            fontWeight: 700,
          },
        },
        'eventos-regiao.vercel.app',
      ),
    ],
  )

  return new ImageResponse(arvore, { width: 1200, height: 630 })
}
