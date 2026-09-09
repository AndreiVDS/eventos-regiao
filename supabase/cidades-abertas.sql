-- ============================================================
--  Cidades sugeridas por organizadores + cadastro pela equipe
--  Cole no SQL Editor do Supabase e execute. Seguro rodar de novo.
-- ============================================================

-- 1. Coluna "aprovada": as 16 cidades atuais ficam aprovadas; cidades novas
--    enviadas por organizadores entram como não aprovadas.
alter table public.cidades add column if not exists aprovada boolean not null default true;
update public.cidades set aprovada = true where aprovada is distinct from true;

-- 2. Leitura pública só das cidades aprovadas (a equipe continua vendo todas).
drop policy if exists "cidades: leitura pública" on public.cidades;
create policy "cidades: leitura pública"
  on public.cidades for select using (aprovada or public.is_equipe());

-- 3. Um organizador logado pode sugerir uma cidade nova (sempre não aprovada).
drop policy if exists "cidades: organizador sugere" on public.cidades;
create policy "cidades: organizador sugere"
  on public.cidades for insert to authenticated
  with check (aprovada = false);
