-- =====================================================================
--  Eventos Região — esquema do banco de dados (Supabase / PostgreSQL)
-- =====================================================================
--  Como usar:
--  1. Crie um projeto em https://supabase.com
--  2. Abra "SQL Editor" e cole este arquivo inteiro; execute.
--  3. Em "Project Settings > API", copie a URL e a chave anon
--     para o arquivo .env (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).
--  4. (Opcional) Rode supabase/seed.sql para carregar os dados de exemplo.
--  5. Em "Authentication > Users", crie os usuários da equipe e adicione
--     os e-mails deles na tabela public.equipe (veja o final do arquivo).
--     Coloque os mesmos e-mails em VITE_ADMIN_EMAILS no .env.
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
  id                  text primary key,
  titulo              text not null,
  descricao           text not null,
  descricao_completa  text,
  categoria           text not null check (categoria in
                       ('cultura','esporte','comunitario','educacao','negocios','gastronomia')),
  cidade              text not null references public.cidades(slug),
  cidade_nome         text not null,
  uf                  text not null,
  local               text not null,
  endereco            text,
  data_inicio         date not null,
  data_fim            date,
  horario             text,
  entrada             text not null check (entrada in ('gratuito','pago','misto')),
  preco_texto         text,
  imagem_url          text,
  link_oficial        text,
  organizador_nome    text not null,
  organizador_contato text,                 -- uso interno; nunca exposto publicamente
  criado_por          uuid references auth.users (id) on delete set null,
  status              text not null default 'pendente'
                       check (status in ('pendente','aprovado','recusado')),
  criado_em           timestamptz not null default now()
);

create index if not exists eventos_status_data_idx on public.eventos (status, data_inicio);
create index if not exists eventos_cidade_idx on public.eventos (cidade);
create index if not exists eventos_criado_por_idx on public.eventos (criado_por);

-- ---------- Tabela: equipe (quem pode moderar) ----------
create table if not exists public.equipe (
  email text primary key
);

-- Função auxiliar: o usuário logado faz parte da equipe?
create or replace function public.is_equipe()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.equipe
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- =====================================================================
--  Segurança em nível de linha (RLS)
-- =====================================================================
alter table public.cidades enable row level security;
alter table public.eventos enable row level security;
alter table public.equipe  enable row level security;

-- cidades: leitura para todos; escrita só para a equipe
drop policy if exists "cidades: leitura pública" on public.cidades;
create policy "cidades: leitura pública"
  on public.cidades for select using (true);

drop policy if exists "cidades: equipe gerencia" on public.cidades;
create policy "cidades: equipe gerencia"
  on public.cidades for all to authenticated
  using (public.is_equipe()) with check (public.is_equipe());

-- eventos: leitura
--   * qualquer um vê os APROVADOS
--   * a pessoa logada vê os que ela mesma cadastrou (qualquer status)
--   * a equipe vê tudo
drop policy if exists "eventos: leitura" on public.eventos;
create policy "eventos: leitura"
  on public.eventos for select
  using (
    status = 'aprovado'
    or criado_por = auth.uid()
    or public.is_equipe()
  );

-- eventos: qualquer um pode ENVIAR, sempre como 'pendente'
drop policy if exists "eventos: envio como pendente" on public.eventos;
create policy "eventos: envio como pendente"
  on public.eventos for insert
  with check (
    status = 'pendente'
    and (criado_por is null or criado_por = auth.uid())
  );

-- eventos: só a equipe altera (aprovar / recusar / editar)
drop policy if exists "eventos: equipe modera" on public.eventos;
create policy "eventos: equipe modera"
  on public.eventos for update to authenticated
  using (public.is_equipe()) with check (public.is_equipe());

-- equipe: cada um só enxerga o próprio registro (evita listar todos os admins)
drop policy if exists "equipe: vê a si mesmo" on public.equipe;
create policy "equipe: vê a si mesmo"
  on public.equipe for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- =====================================================================
--  View pública sem dados de contato (recomendada para leitura anônima)
-- =====================================================================
create or replace view public.eventos_publicos as
  select
    id, titulo, descricao, descricao_completa, categoria, cidade,
    cidade_nome, uf, local, endereco, data_inicio, data_fim, horario,
    entrada, preco_texto, imagem_url, link_oficial, organizador_nome,
    status, criado_em
  from public.eventos
  where status = 'aprovado';

-- =====================================================================
--  Cadastro da equipe — troque pelos e-mails reais
-- =====================================================================
-- insert into public.equipe (email) values
--   ('fulano@exemplo.com'),
--   ('ciclana@exemplo.com')
-- on conflict do nothing;
