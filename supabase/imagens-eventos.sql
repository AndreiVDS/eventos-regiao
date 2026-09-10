-- Atualiza a imagem e a recorrência dos 27 eventos de exemplo no banco
-- (o seed com "on conflict" antigo não mexia nesses campos).
-- Seguro rodar mais de uma vez. Cole INTEIRO no SQL Editor do Supabase.

alter table public.eventos add column if not exists recorrencia text;

update public.eventos as e
   set imagem_url = c.imagem_url, recorrencia = c.recorrencia
  from (values
  ('schutzenfest-2026', '/img/1122.png', 'anual'),
  ('novale-experience-2026', '/img/novale.png', 'anual'),
  ('fashion-tech-2026', '/img/fashiontech.png', null),
  ('casa-inteligente-2026', '/img/intelbrass.png', null),
  ('curso-oratoria-2027', '/img/oratoria.jpg', null),
  ('comedia-daqui-2026', '/img/comedia.jpg', 'semanal'),
  ('oktoberfest-blumenau-2026', '/img/chiseta.jpg', 'anual'),
  ('festival-danca-joinville-2027', '/img/eventos/tema/danca.jpg', 'anual'),
  ('boi-de-mamao-floripa-2026', '/img/eventos/tema/boi-mamao.jpg', 'anual'),
  ('natal-curitiba-2026', '/img/eventos/tema/natal-cidade.jpg', 'anual'),
  ('festival-teatro-curitiba-2027', '/img/eventos/tema/teatro.jpg', 'anual'),
  ('feira-parque-ipanema-2026', '/img/PARQUE-IPANEMA-FECHADA-scaled.jpg', 'anual'),
  ('corrida-vale-do-aco-2026', '/img/ipatinga-parque-ipanema.jpg', 'anual'),
  ('rock-in-rio-2026', '/img/eventos/tema/show.jpg', null),
  ('reveillon-copacabana-2027', '/img/eventos/tema/fogos.jpg', 'anual'),
  ('acampamento-farroupilha-poa-2026', '/img/eventos/tema/virada.jpg', 'anual'),
  ('feira-do-livro-poa-2026', '/img/eventos/tema/feira-livro.jpg', 'anual'),
  ('natal-luz-gramado-2026', '/img/eventos/tema/natal-luz.jpg', 'anual'),
  ('sao-silvestre-2026', '/img/eventos/tema/corrida.jpg', 'anual'),
  ('virada-cultural-sp-2027', '/img/eventos/tema/virada.jpg', 'anual'),
  ('flip-paraty-2027', '/img/eventos/tema/feira-livro.jpg', 'anual'),
  ('festival-inverno-campos-do-jordao-2027', '/img/eventos/tema/orquestra.jpg', 'anual'),
  ('festival-parintins-2027', '/img/eventos/tema/parintins.jpg', 'anual'),
  ('festa-iemanja-salvador-2027', '/img/eventos/tema/iemanja.jpg', 'anual'),
  ('lavagem-do-bonfim-2027', '/img/eventos/tema/bonfim.jpg', 'anual'),
  ('carnaval-olinda-2027', '/img/eventos/tema/carnaval-olinda.jpg', 'anual'),
  ('forum-das-letras-ouro-preto-2026', '/img/eventos/tema/feira-livro.jpg', 'anual')
) as c(id, imagem_url, recorrencia)
 where e.id = c.id;
