-- Coordenadas do LOCAL de cada evento (para a distância "perto de mim").
-- Seguro rodar mais de uma vez. Cole no SQL Editor do Supabase e execute.

alter table public.eventos add column if not exists lat double precision;
alter table public.eventos add column if not exists lng double precision;

update public.eventos set lat = -26.4736, lng = -49.064 where id = 'schutzenfest-2026';
update public.eventos set lat = -26.482, lng = -49.071 where id = 'novale-experience-2026';
update public.eventos set lat = -26.482, lng = -49.071 where id = 'fashion-tech-2026';
update public.eventos set lat = -26.483, lng = -49.068 where id = 'casa-inteligente-2026';
update public.eventos set lat = -26.489, lng = -49.077 where id = 'curso-oratoria-2027';
update public.eventos set lat = -26.48, lng = -49.07 where id = 'comedia-daqui-2026';
update public.eventos set lat = -26.906, lng = -49.079 where id = 'oktoberfest-blumenau-2026';
update public.eventos set lat = -26.282, lng = -48.848 where id = 'festival-danca-joinville-2027';
update public.eventos set lat = -27.5975, lng = -48.5495 where id = 'boi-de-mamao-floripa-2026';
update public.eventos set lat = -25.429, lng = -49.271 where id = 'natal-curitiba-2026';
update public.eventos set lat = -25.434, lng = -49.271 where id = 'festival-teatro-curitiba-2027';
update public.eventos set lat = -19.478, lng = -42.547 where id = 'feira-parque-ipanema-2026';
update public.eventos set lat = -19.4685, lng = -42.537 where id = 'corrida-vale-do-aco-2026';
update public.eventos set lat = -22.9755, lng = -43.393 where id = 'rock-in-rio-2026';
update public.eventos set lat = -22.9711, lng = -43.1822 where id = 'reveillon-copacabana-2027';
update public.eventos set lat = -30.033, lng = -51.24 where id = 'acampamento-farroupilha-poa-2026';
update public.eventos set lat = -30.0277, lng = -51.2287 where id = 'feira-do-livro-poa-2026';
update public.eventos set lat = -29.3785, lng = -50.8735 where id = 'natal-luz-gramado-2026';
update public.eventos set lat = -23.5614, lng = -46.656 where id = 'sao-silvestre-2026';
update public.eventos set lat = -23.546, lng = -46.637 where id = 'virada-cultural-sp-2027';
update public.eventos set lat = -23.2195, lng = -44.718 where id = 'flip-paraty-2027';
update public.eventos set lat = -22.7, lng = -45.546 where id = 'festival-inverno-campos-do-jordao-2027';
update public.eventos set lat = -2.631, lng = -56.736 where id = 'festival-parintins-2027';
update public.eventos set lat = -13.011, lng = -38.487 where id = 'festa-iemanja-salvador-2027';
update public.eventos set lat = -12.923, lng = -38.508 where id = 'lavagem-do-bonfim-2027';
update public.eventos set lat = -8.009, lng = -34.843 where id = 'carnaval-olinda-2027';
update public.eventos set lat = -20.3855, lng = -43.5035 where id = 'forum-das-letras-ouro-preto-2026';
