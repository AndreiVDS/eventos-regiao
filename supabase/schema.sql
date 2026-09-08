-- =====================================================================
--  Eventos Região — esquema do banco de dados (Supabase / PostgreSQL)
-- =====================================================================
--  Como usar:
--  1. Crie um projeto em https://supabase.com
--  2. Abra "SQL Editor" e cole este arquivo inteiro; execute.
--  3. Em "Project Settings > API", copie a URL e a chave anon
--     para o arquivo .env (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).
--  4. Rode o seed opcional em supabase/seed.sql para carregar os
--     dados de exemplo.
-- =====================================================================

-- ---------- Tabela: cidades ----------
create table if not exists public.cidades (
  slug            text primary key,
  nome            text not null,
  uf              text not null,
  regiao          text not null,
  descricao       text not null default '',
  imagem_url      text,
  site_prefeitura text
);

-- ---------- Tabela: eventos ----------
-- id é texto (slug legível na URL, ex.: "rock-in-rio-2026"); o app gera
-- o slug a partir do título ao cadastrar um evento novo.
create table if not exists public.eventos (
  id                 text primary key,
  titulo             text not null,
  descricao          text not null,
  descricao_completa text,
  categoria          text not null check (categoria in
                      ('cultura','esporte','comunitario','educacao','negocios','gastronomia')),
  cidade             text not null references public.cidades(slug),
  cidade_nome        text not null,
  uf                 text not null,
  local              text not null,
  endereco           text,
  data_inicio        date not null,
  data_fim           date,
  horario            text,
  entrada            text not null check (entrada in ('gratuito','pago','misto')),
  preco_texto        text,
  imagem_url         text,
  link_oficial       text,
  organizador_nome   text not null,
  organizador_contato text,               -- uso interno; nunca exposto publicamente
  status             text not null default 'pendente'
                      check (status in ('pendente','aprovado','recusado')),
  criado_em          timestamptz not null default now()
);

create index if not exists eventos_status_data_idx on public.eventos (status, data_inicio);
create index if not exists eventos_cidade_idx on public.eventos (cidade);

-- =====================================================================
--  Segurança em nível de linha (RLS)
-- =====================================================================
alter table public.cidades enable row level security;
alter table public.eventos enable row level security;

-- Qualquer visitante pode LER a lista de cidades.
create policy "cidades: leitura pública"
  on public.cidades for select
  using (true);

-- Qualquer visitante pode LER apenas eventos APROVADOS.
-- (a coluna organizador_contato continua acessível só para quem tem
--  papel de serviço / painel; para escondê-la de vez, use uma view.)
create policy "eventos: leitura dos aprovados"
  on public.eventos for select
  using (status = 'aprovado');

-- Qualquer visitante pode ENVIAR um evento, desde que já entre como
-- 'pendente' (não dá para publicar direto).
create policy "eventos: envio público como pendente"
  on public.eventos for insert
  with check (status = 'pendente');

-- Apenas usuários autenticados (a equipe) podem LER tudo e MODERAR.
create policy "eventos: equipe lê tudo"
  on public.eventos for select
  to authenticated
  using (true);

create policy "eventos: equipe atualiza"
  on public.eventos for update
  to authenticated
  using (true)
  with check (true);

create policy "cidades: equipe gerencia"
  on public.cidades for all
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
--  View pública sem dados de contato (opcional, recomendada)
-- =====================================================================
create or replace view public.eventos_publicos as
  select
    id, titulo, descricao, descricao_completa, categoria, cidade,
    cidade_nome, uf, local, endereco, data_inicio, data_fim, horario,
    entrada, preco_texto, imagem_url, link_oficial, organizador_nome,
    status, criado_em
  from public.eventos
  where status = 'aprovado';
