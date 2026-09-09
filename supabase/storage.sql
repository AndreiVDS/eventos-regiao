-- ============================================================
--  Armazenamento de imagens de eventos (Supabase Storage)
--  Cole no SQL Editor do Supabase e execute uma vez.
--  Seguro rodar de novo.
-- ============================================================

-- 1. Bucket público "eventos" (leitura por qualquer um, upload só logado)
insert into storage.buckets (id, name, public)
values ('eventos', 'eventos', true)
on conflict (id) do update set public = true;

-- 2. Políticas de acesso ao bucket
drop policy if exists "eventos leitura publica" on storage.objects;
create policy "eventos leitura publica"
  on storage.objects for select
  using (bucket_id = 'eventos');

drop policy if exists "eventos upload logado" on storage.objects;
create policy "eventos upload logado"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'eventos');

-- (opcional) permitir que a equipe apague imagens
drop policy if exists "eventos equipe apaga" on storage.objects;
create policy "eventos equipe apaga"
  on storage.objects for delete to authenticated
  using (bucket_id = 'eventos' and public.is_equipe());
