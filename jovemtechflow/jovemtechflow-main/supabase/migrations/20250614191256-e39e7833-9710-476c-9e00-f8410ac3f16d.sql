
-- Crie bucket privado para avatares
insert into storage.buckets (id, name, public)
values ('private-avatars', 'private-avatars', false)
on conflict do nothing;

-- Permitir ao usuário autenticado fazer upload no próprio bucket
create policy "Users can upload their private avatar"
  on storage.objects for insert
  with check (bucket_id = 'private-avatars' and auth.uid()::uuid = owner);

-- Permitir ao usuário autenticado selecionar (ler) seus próprios arquivos
create policy "User can view their private avatar"
  on storage.objects for select
  using (bucket_id = 'private-avatars' and auth.uid()::uuid = owner);

-- Permitir ao usuário deletar o próprio avatar
create policy "User can delete private avatar"
  on storage.objects for delete
  using (bucket_id = 'private-avatars' and auth.uid()::uuid = owner);

-- Permitir ao usuário atualizar o próprio avatar
create policy "User can update private avatar"
  on storage.objects for update
  using (bucket_id = 'private-avatars' and auth.uid()::uuid = owner);
