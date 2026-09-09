-- Coordenadas do LOCAL de cada evento (distância "perto de mim").
-- Seguro rodar mais de uma vez. Cole INTEIRO no SQL Editor do Supabase.

alter table public.eventos add column if not exists lat double precision;
alter table public.eventos add column if not exists lng double precision;

update public.eventos as e
   set lat = c.lat, lng = c.lng
  from (values
  ('schutzenfest-2026', -26.4736, -49.064),
  ('novale-experience-2026', -26.482, -49.071),
  ('fashion-tech-2026', -26.482, -49.071),
  ('casa-inteligente-2026', -26.483, -49.068),
  ('curso-oratoria-2027', -26.489, -49.077),
  ('comedia-daqui-2026', -26.48, -49.07),
  ('oktoberfest-blumenau-2026', -26.906, -49.079),
  ('festival-danca-joinville-2027', -26.282, -48.848),
  ('boi-de-mamao-floripa-2026', -27.5975, -48.5495),
  ('natal-curitiba-2026', -25.429, -49.271),
  ('festival-teatro-curitiba-2027', -25.434, -49.271),
  ('feira-parque-ipanema-2026', -19.478, -42.547),
  ('corrida-vale-do-aco-2026', -19.4685, -42.537),
  ('rock-in-rio-2026', -22.9755, -43.393),
  ('reveillon-copacabana-2027', -22.9711, -43.1822),
  ('acampamento-farroupilha-poa-2026', -30.033, -51.24),
  ('feira-do-livro-poa-2026', -30.0277, -51.2287),
  ('natal-luz-gramado-2026', -29.3785, -50.8735),
  ('sao-silvestre-2026', -23.5614, -46.656),
  ('virada-cultural-sp-2027', -23.546, -46.637),
  ('flip-paraty-2027', -23.2195, -44.718),
  ('festival-inverno-campos-do-jordao-2027', -22.7, -45.546),
  ('festival-parintins-2027', -2.631, -56.736),
  ('festa-iemanja-salvador-2027', -13.011, -38.487),
  ('lavagem-do-bonfim-2027', -12.923, -38.508),
  ('carnaval-olinda-2027', -8.009, -34.843),
  ('forum-das-letras-ouro-preto-2026', -20.3855, -43.5035)
) as c(id, lat, lng)
 where e.id = c.id;
