
-- Tabela para comentários em posts do fórum (já criada na tentativa anterior, vai pular se existir)
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS já ativada na tentativa anterior, então só recriando as policies
DROP POLICY IF EXISTS "Users can delete/update their comments" ON public.forum_comments;
DROP POLICY IF EXISTS "Users can comment on posts" ON public.forum_comments;
DROP POLICY IF EXISTS "Authenticated can select comments" ON public.forum_comments;

-- Permissão para inserir comentários
CREATE POLICY "Users can comment on posts" 
  ON public.forum_comments
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Permissão para deletar comentários (um policy para update, outro para delete!)
CREATE POLICY "Users can delete their comments" 
  ON public.forum_comments
  FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can update their comments" 
  ON public.forum_comments
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Visualização aberta para autenticados
CREATE POLICY "Authenticated can select comments" 
  ON public.forum_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Tabela para inscrições em eventos (já criada na tentativa anterior, vai pular se existir)
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Policies repetem o mesmo padrão:
DROP POLICY IF EXISTS "Users can register themselves in events" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can view their own event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can remove their own registration" ON public.event_registrations;

CREATE POLICY "Users can register themselves in events"
  ON public.event_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own event registrations"
  ON public.event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their own registration"
  ON public.event_registrations
  FOR DELETE
  USING (auth.uid() = user_id);
