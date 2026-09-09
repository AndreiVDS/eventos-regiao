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
