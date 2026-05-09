
-- Criação do tipo ENUM "app_role" apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.learning_tracks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    progress_percent int DEFAULT 0,
    status TEXT DEFAULT 'locked'
);

CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id uuid REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tags TEXT[],
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    solved BOOL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    max_attendees INT,
    tags TEXT[]
);

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Políticas de RLS sem IF NOT EXISTS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem ler"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem criar projetos"
  ON public.projects
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins podem editar projetos"
  ON public.projects
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins podem remover projetos"
  ON public.projects
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Todos podem ver projetos"
  ON public.projects
  FOR SELECT
  USING (TRUE);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem criar eventos"
  ON public.events
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins podem editar eventos"
  ON public.events
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins podem remover eventos"
  ON public.events
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Todos podem ver eventos"
  ON public.events
  FOR SELECT
  USING (TRUE);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Somente autor pode atualizar seu post"
  ON public.forum_posts
  FOR UPDATE
  USING (auth.uid() = author_id);
CREATE POLICY "Somente autor pode deletar seu post"
  ON public.forum_posts
  FOR DELETE
  USING (auth.uid() = author_id);
CREATE POLICY "Usuários autenticados podem postar"
  ON public.forum_posts
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Todos podem ler posts"
  ON public.forum_posts
  FOR SELECT
  USING (TRUE);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário pode se inscrever em evento"
  ON public.event_registrations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuário pode listar suas inscrições"
  ON public.event_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins criam trilhas"
  ON public.learning_tracks
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Todos podem ver trilhas"
  ON public.learning_tracks
  FOR SELECT
  USING (TRUE);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins criam cursos"
  ON public.courses
  FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Todos podem ver cursos"
  ON public.courses
  FOR SELECT
  USING (TRUE);
