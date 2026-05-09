
-- Corrigir a função get_user_by_email para funcionar corretamente
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
RETURNS table(user_id uuid, username text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id as user_id, p.username, p.email
  FROM public.profiles p
  WHERE p.email ILIKE user_email;
END;
$$;

-- Adicionar políticas RLS para project_enrollments
CREATE POLICY "Everyone can view project enrollments for counting"
  ON public.project_enrollments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can delete their own enrollments"
  ON public.project_enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar políticas RLS para event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view event registrations for counting"
  ON public.event_registrations
  FOR SELECT
  USING (true);

CREATE POLICY "Users can register themselves"
  ON public.event_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Adicionar políticas RLS para forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view forum posts"
  ON public.forum_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Adicionar políticas RLS para forum_comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view forum comments"
  ON public.forum_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.forum_comments
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);
