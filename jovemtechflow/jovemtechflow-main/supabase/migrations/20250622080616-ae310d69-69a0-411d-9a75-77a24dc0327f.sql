
-- Criar bucket para uploads de arquivos de eventos e projetos
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-files', 'content-files', true)
ON CONFLICT DO NOTHING;

-- Políticas para o bucket content-files
CREATE POLICY "Usuários autenticados podem fazer upload de arquivos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Arquivos são públicos para visualização"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-files');

CREATE POLICY "Usuários podem deletar seus próprios arquivos"
ON storage.objects FOR DELETE
USING (bucket_id = 'content-files' AND owner = auth.uid());

-- Adicionar coluna content_text à tabela event_contents se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'event_contents' 
                   AND column_name = 'content_text') THEN
        ALTER TABLE public.event_contents ADD COLUMN content_text text;
    END IF;
END $$;

-- Adicionar coluna content_text à tabela project_contents se não existir  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_contents' 
                   AND column_name = 'content_text') THEN
        ALTER TABLE public.project_contents ADD COLUMN content_text text;
    END IF;
END $$;
