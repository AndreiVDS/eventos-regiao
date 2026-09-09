-- ============================================================
--  Extras: motivo de recusa, recorrência e mensagens de contato
--  Cole no SQL Editor do Supabase e execute. Seguro rodar de novo.
-- ============================================================

-- 1. Motivo da recusa (o organizador vê em "Meus eventos")
alter table public.eventos add column if not exists motivo_recusa text;

-- 2. Recorrência do evento (fixo semanal/mensal/anual)
alter table public.eventos add column if not exists recorrencia text
  check (recorrencia is null or recorrencia in ('semanal','mensal','anual'));

-- 3. Mensagens enviadas pela página /contato
create table if not exists public.contatos (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  email      text not null,
  assunto    text,
  mensagem   text not null,
  criado_em  timestamptz not null default now()
);
alter table public.contatos enable row level security;

-- qualquer visitante pode enviar
drop policy if exists "contatos: qualquer um envia" on public.contatos;
create policy "contatos: qualquer um envia"
  on public.contatos for insert to anon, authenticated
  with check (true);

-- só a equipe lê
drop policy if exists "contatos: equipe lê" on public.contatos;
create policy "contatos: equipe lê"
  on public.contatos for select to authenticated
  using (public.is_equipe());

-- 4. Destaque pago (fluxo manual, sem gateway de pagamento)
alter table public.eventos add column if not exists patrocinado boolean not null default false;

create table if not exists public.pedidos_destaque (
  id         uuid primary key default gen_random_uuid(),
  evento_id  text not null references public.eventos (id) on delete cascade,
  dias       int not null default 7,
  observacao text,
  status     text not null default 'solicitado'
             check (status in ('solicitado','pago','recusado')),
  criado_por uuid references auth.users (id) on delete set null,
  criado_em  timestamptz not null default now()
);
alter table public.pedidos_destaque enable row level security;

-- o dono do evento cria o pedido; a equipe também pode ver/gerir tudo
drop policy if exists "pedidos: dono cria" on public.pedidos_destaque;
create policy "pedidos: dono cria"
  on public.pedidos_destaque for insert to authenticated
  with check (
    criado_por = auth.uid()
    and exists (select 1 from public.eventos e where e.id = evento_id and e.criado_por = auth.uid())
  );

drop policy if exists "pedidos: dono e equipe leem" on public.pedidos_destaque;
create policy "pedidos: dono e equipe leem"
  on public.pedidos_destaque for select to authenticated
  using (criado_por = auth.uid() or public.is_equipe());

drop policy if exists "pedidos: equipe resolve" on public.pedidos_destaque;
create policy "pedidos: equipe resolve"
  on public.pedidos_destaque for update to authenticated
  using (public.is_equipe()) with check (public.is_equipe());
