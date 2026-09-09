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
  lat             double precision,
  lng             double precision,
  imagem_url      text,
  site_prefeitura text,
  -- false = cidade sugerida por um organizador, ainda não publicada.
  -- Vira true quando a equipe aprova (o evento que a trouxe, ou pelo painel).
  aprovada        boolean not null default true
);
-- Se a tabela já existia sem estas colunas:
alter table public.cidades add column if not exists lat double precision;
alter table public.cidades add column if not exists lng double precision;
alter table public.cidades add column if not exists aprovada boolean not null default true;
alter table public.eventos add column if not exists formato text not null default 'presencial';
alter table public.eventos add column if not exists destaque boolean not null default false;
alter table public.eventos add column if not exists lat double precision;
alter table public.eventos add column if not exists lng double precision;
-- migração incremental para bases já existentes (bases novas já têm no create):
do $$ begin
  if to_regclass('public.eventos') is not null then
    alter table public.eventos add column if not exists recorrencia text;
    alter table public.eventos add column if not exists motivo_recusa text;
  end if;
end $$;

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
  formato             text not null default 'presencial'
                       check (formato in ('presencial','online','hibrido')),
  destaque            boolean not null default false,
  cidade              text not null references public.cidades(slug),
  cidade_nome         text not null,
  uf                  text not null,
  local               text not null,
  endereco            text,
  lat                 double precision,   -- coordenadas do LOCAL do evento
  lng                 double precision,   -- (para a distância "perto de mim")
  recorrencia         text check (recorrencia is null or recorrencia in ('semanal','mensal','anual')),
  motivo_recusa       text,
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

-- cidades: leitura pública só das aprovadas (a equipe vê todas)
drop policy if exists "cidades: leitura pública" on public.cidades;
create policy "cidades: leitura pública"
  on public.cidades for select using (aprovada or public.is_equipe());

drop policy if exists "cidades: equipe gerencia" on public.cidades;
create policy "cidades: equipe gerencia"
  on public.cidades for all to authenticated
  using (public.is_equipe()) with check (public.is_equipe());

-- um organizador logado pode SUGERIR uma cidade nova (sempre como não aprovada)
drop policy if exists "cidades: organizador sugere" on public.cidades;
create policy "cidades: organizador sugere"
  on public.cidades for insert to authenticated
  with check (aprovada = false);

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

-- ---------- Tabela: presencas ("Vou participar") ----------
create table if not exists public.presencas (
  evento_id  text not null references public.eventos (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  criado_em  timestamptz not null default now(),
  primary key (evento_id, usuario_id)
);
create index if not exists presencas_evento_idx on public.presencas (evento_id);

alter table public.presencas enable row level security;

-- leitura liberada (só expõe ids de usuário — permite contar e saber "eu vou")
drop policy if exists "presencas: leitura" on public.presencas;
create policy "presencas: leitura" on public.presencas for select using (true);

-- cada um marca/desmarca a própria presença
drop policy if exists "presencas: marca a própria" on public.presencas;
create policy "presencas: marca a própria"
  on public.presencas for insert to authenticated
  with check (usuario_id = auth.uid());

drop policy if exists "presencas: desmarca a própria" on public.presencas;
create policy "presencas: desmarca a própria"
  on public.presencas for delete to authenticated
  using (usuario_id = auth.uid());

-- ---------- Tabela: contatos (mensagens da página /contato) ----------
create table if not exists public.contatos (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  email      text not null,
  assunto    text,
  mensagem   text not null,
  criado_em  timestamptz not null default now()
);
alter table public.contatos enable row level security;

drop policy if exists "contatos: qualquer um envia" on public.contatos;
create policy "contatos: qualquer um envia"
  on public.contatos for insert to anon, authenticated with check (true);

drop policy if exists "contatos: equipe lê" on public.contatos;
create policy "contatos: equipe lê"
  on public.contatos for select to authenticated using (public.is_equipe());

-- =====================================================================
--  View pública sem dados de contato (recomendada para leitura anônima)
-- =====================================================================
create or replace view public.eventos_publicos as
  select
    id, titulo, descricao, descricao_completa, categoria, cidade,
    cidade_nome, uf, local, endereco, lat, lng, data_inicio, data_fim, horario,
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
