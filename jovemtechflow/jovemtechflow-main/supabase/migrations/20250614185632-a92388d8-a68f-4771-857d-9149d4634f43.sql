
-- Cria o bucket para avatares como público (se ainda não existir)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- Permissão para qualquer usuário listar objetos
create policy "Avatar bucket objects are accessible to anyone"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Permissão para qualquer usuário inserir/upload no bucket de avatar
create policy "Any authenticated user can upload avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

-- Permissão para qualquer usuário remover o próprio avatar
create policy "User can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid()::uuid);

-- Permissão para qualquer usuário atualizar o próprio avatar (opcional)
create policy "User can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid()::uuid);
