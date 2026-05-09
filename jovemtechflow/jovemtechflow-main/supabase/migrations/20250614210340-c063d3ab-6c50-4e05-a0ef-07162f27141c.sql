
-- Cria a tabela de conteúdos para eventos
CREATE TABLE public.event_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_id uuid,
  title text NOT NULL,
  description text,
  content_type text DEFAULT 'text', -- exemplos: text, link, file, video
  content_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilita RLS na tabela
ALTER TABLE public.event_contents ENABLE ROW LEVEL SECURITY;

-- Permite que apenas administradores possam inserir conteúdos
CREATE POLICY "Admins can insert event content"
ON public.event_contents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Permite que apenas administradores possam atualizar conteúdos
CREATE POLICY "Admins can update event content"
ON public.event_contents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Permite que apenas administradores possam excluir conteúdos
CREATE POLICY "Admins can delete event content"
ON public.event_contents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Permite que todos usuários autenticados VEJAM os conteúdos dos eventos aos quais estão inscritos
CREATE POLICY "Subscribed users can view event content"
ON public.event_contents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM event_registrations
    WHERE user_id = auth.uid() AND event_id = event_contents.event_id
  )
);
