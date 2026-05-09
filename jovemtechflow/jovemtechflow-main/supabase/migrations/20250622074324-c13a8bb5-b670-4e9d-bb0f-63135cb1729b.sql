
-- Adicionar a coluna author_id à tabela project_contents
ALTER TABLE public.project_contents 
ADD COLUMN author_id uuid REFERENCES auth.users;

-- Atualizar registros existentes para ter um author_id válido (opcional)
-- UPDATE public.project_contents 
-- SET author_id = (SELECT id FROM auth.users LIMIT 1)
-- WHERE author_id IS NULL;
