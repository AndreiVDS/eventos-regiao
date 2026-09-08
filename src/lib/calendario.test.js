import { describe, it, expect } from 'vitest'
import { linkGoogleAgenda, gerarICS } from './calendario'

const evento = {
  id: 'oktoberfest-blumenau-2026',
  titulo: 'Oktoberfest Blumenau 2026',
  descricao: 'A segunda maior festa alemã do mundo.',
  categoria: 'gastronomia',
  cidade_nome: 'Blumenau',
  uf: 'SC',
  local: 'Parque Vila Germânica',
  endereco: 'Rua Alberto Stein, 199',
  data_inicio: '2026-10-07',
  data_fim: '2026-10-25',
  horario: 'A partir das 17h',
  entrada: 'pago',
  preco_texto: 'A partir de R$ 20',
  link_oficial: 'https://www.vilagermanica.com.br',
}

describe('linkGoogleAgenda', () => {
  const url = linkGoogleAgenda(evento)
  it('aponta para o Google Agenda', () => {
    expect(url).toContain('https://calendar.google.com/calendar/render')
  })
  it('usa o intervalo com fim exclusivo (dia seguinte)', () => {
    expect(decodeURIComponent(url)).toContain('dates=20261007/20261026')
  })
  it('inclui título e local', () => {
    const d = decodeURIComponent(url).replace(/\+/g, ' ')
    expect(d).toContain('Oktoberfest Blumenau 2026')
    expect(d).toContain('Blumenau/SC')
  })
})

describe('gerarICS', () => {
  const ics = gerarICS(evento)
  it('é um VCALENDAR/VEVENT válido', () => {
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
  })
  it('usa datas de dia inteiro com fim exclusivo', () => {
    expect(ics).toContain('DTSTART;VALUE=DATE:20261007')
    expect(ics).toContain('DTEND;VALUE=DATE:20261026')
  })
  it('escapa vírgulas na descrição/local', () => {
    expect(ics).toContain('Rua Alberto Stein\\, 199')
  })
})
