
-- Tabela de conteúdos dos projetos (etapas)
CREATE TABLE IF NOT EXISTS public.project_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'text',
  content_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de progresso do usuário nas etapas do projeto
CREATE TABLE IF NOT EXISTS public.project_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES project_contents(id) ON DELETE CASCADE,
  progress_num INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id, content_id)
);

-- RLS: só pode ver/inserir/alterar progresso do próprio usuário
ALTER TABLE public.project_progressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seu próprio progresso" ON public.project_progressions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Usuário altera seu próprio progresso" ON public.project_progressions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Usuário insere seu próprio progresso" ON public.project_progressions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Conteúdos dos eventos (mesma lógica)
CREATE TABLE IF NOT EXISTS public.event_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'text',
  content_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Progresso dos eventos
CREATE TABLE IF NOT EXISTS public.event_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES event_contents(id) ON DELETE CASCADE,
  progress_num INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id, content_id)
);

ALTER TABLE public.event_progressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê seu próprio progresso evento" ON public.event_progressions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Usuário altera seu próprio progresso evento" ON public.event_progressions
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Usuário insere seu próprio progresso evento" ON public.event_progressions
  FOR INSERT WITH CHECK (user_id = auth.uid());
