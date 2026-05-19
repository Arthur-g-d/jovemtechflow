-- ============================================================================
-- SECURITY HARDENING MIGRATION
-- Endereça: CRIT-01 (escalada de privilégios), CRIT-03 (admin self-elect),
-- HIGH-01 (get_user_by_email vaza dados), HIGH-02 (RLS permissiva em
-- project_enrollments / event_registrations).
-- ----------------------------------------------------------------------------
-- IMPORTANTE: esta migration assume que existe ao menos UM admin já registrado
-- em user_roles. Se o projeto está em produção com dados reais, confirme isso
-- ANTES de aplicar.
-- ============================================================================

-- 1) Função has_role: SECURITY DEFINER para evitar recursão em policies
--    de user_roles e centralizar a checagem de papéis.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;

-- 2) Bloquear escalada de privilégios em user_roles.
--    Drop policies antigas (qualquer uma) e recriar restritivas.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

-- SELECT: usuário vê apenas o próprio papel; admin vê tudo.
CREATE POLICY "user_roles_select_own_or_admin"
  ON public.user_roles
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- INSERT/UPDATE/DELETE: somente admins (via has_role).
-- O cliente NUNCA deve poder inserir 'admin' direto.
CREATE POLICY "user_roles_insert_admin_only"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_update_admin_only"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_delete_admin_only"
  ON public.user_roles
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    AND user_id <> auth.uid()
  );

-- 3) Restringir get_user_by_email a admins.
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
RETURNS table(user_id uuid, username text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem buscar usuários por email'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT p.id AS user_id, p.username, p.email
  FROM public.profiles p
  WHERE p.email ILIKE user_email;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_by_email(text) TO authenticated;

-- 4) Restringir SELECT em project_enrollments / event_registrations.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_enrollments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_enrollments', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.project_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_enrollments_select_own_or_admin"
  ON public.project_enrollments
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "project_enrollments_insert_self"
  ON public.project_enrollments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND enrolled_by_admin = false
  );

CREATE POLICY "project_enrollments_admin_all"
  ON public.project_enrollments
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "project_enrollments_delete_own"
  ON public.project_enrollments
  FOR DELETE
  USING (auth.uid() = user_id);

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'event_registrations'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.event_registrations', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_registrations_select_own_or_admin"
  ON public.event_registrations
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "event_registrations_insert_self"
  ON public.event_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_registrations_delete_own"
  ON public.event_registrations
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "event_registrations_admin_all"
  ON public.event_registrations
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Funções de contagem pública (substituem o SELECT USING (true)).
CREATE OR REPLACE FUNCTION public.count_project_enrollments(p_project_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.project_enrollments
  WHERE project_id = p_project_id;
$$;

REVOKE ALL ON FUNCTION public.count_project_enrollments(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_project_enrollments(uuid) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.count_event_registrations(p_event_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM public.event_registrations
  WHERE event_id = p_event_id;
$$;

REVOKE ALL ON FUNCTION public.count_event_registrations(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_event_registrations(uuid) TO authenticated, anon;

-- 6) Helpers de "estou inscrito?".
CREATE OR REPLACE FUNCTION public.is_enrolled_in_project(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_enrollments
    WHERE project_id = p_project_id AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_enrolled_in_project(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_enrolled_in_project(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_registered_for_event(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.event_registrations
    WHERE event_id = p_event_id AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_registered_for_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_registered_for_event(uuid) TO authenticated;

COMMENT ON FUNCTION public.has_role(uuid, app_role) IS
  'Verifica se um usuário tem determinado papel. SECURITY DEFINER para evitar recursão de RLS em user_roles.';
COMMENT ON FUNCTION public.get_user_by_email(text) IS
  'Busca usuário por email. Restrito a admins via RAISE EXCEPTION.';
