-- ============================================================
-- Correções de segurança: RLS
-- Resolve: IDOR em projetos/eventos, tabelas sem proteção,
--          privilege escalation em user_roles
-- ============================================================

-- ----------------------------------------------------------------
-- 1. PROJETOS — restringir UPDATE/DELETE ao criador (author_id)
--    Problema anterior: qualquer admin apagava projetos alheios
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Admins podem editar projetos" ON public.projects;
DROP POLICY IF EXISTS "Admins podem remover projetos" ON public.projects;

CREATE POLICY "Criador pode editar seu projeto"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Criador pode remover seu projeto"
  ON public.projects FOR DELETE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 2. EVENTOS — restringir UPDATE/DELETE ao criador (created_by)
--    Problema anterior: qualquer admin apagava eventos alheios
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Admins podem editar eventos" ON public.events;
DROP POLICY IF EXISTS "Admins podem remover eventos" ON public.events;

CREATE POLICY "Criador pode editar seu evento"
  ON public.events FOR UPDATE
  USING (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Criador pode remover seu evento"
  ON public.events FOR DELETE
  USING (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 3. PROJECT_MODULES — habilitar RLS (tabela estava sem proteção)
--    Qualquer usuário autenticado podia criar/editar/deletar módulos
-- ----------------------------------------------------------------
ALTER TABLE public.project_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver módulos"
  ON public.project_modules FOR SELECT
  USING (true);

CREATE POLICY "Admins podem criar módulos"
  ON public.project_modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Criador do projeto pode editar módulos"
  ON public.project_modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Criador do projeto pode deletar módulos"
  ON public.project_modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND author_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 4. PROJECT_CONTENTS — habilitar RLS (tabela estava sem proteção)
--    Qualquer usuário podia ler/escrever conteúdo de qualquer projeto
-- ----------------------------------------------------------------
ALTER TABLE public.project_contents ENABLE ROW LEVEL SECURITY;

-- Admins veem tudo; inscritos veem apenas o conteúdo do seu projeto
CREATE POLICY "Admins e inscritos podem ver conteúdo do projeto"
  ON public.project_contents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.project_enrollments
      WHERE project_id = project_contents.project_id
        AND user_id = auth.uid()
    )
  );

-- Apenas admins podem criar conteúdo
CREATE POLICY "Admins podem criar conteúdo de projeto"
  ON public.project_contents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas o criador do projeto pode editar/deletar seu conteúdo
CREATE POLICY "Criador do projeto pode editar conteúdo"
  ON public.project_contents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_contents.project_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Criador do projeto pode deletar conteúdo"
  ON public.project_contents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_contents.project_id AND author_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- 5. EVENT_CONTENTS — adicionar SELECT para admins
--    Problema anterior: admins não conseguiam ver conteúdo de evento
--    sem estarem inscritos
-- ----------------------------------------------------------------
CREATE POLICY "Admins podem ver conteúdo de eventos"
  ON public.event_contents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 6. USER_ROLES — bloquear privilege escalation via INSERT direto
--    Com RLS habilitado e sem policy de INSERT explícita, o INSERT
--    é bloqueado. Garantimos que não existe policy permissiva.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Admins podem adicionar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
