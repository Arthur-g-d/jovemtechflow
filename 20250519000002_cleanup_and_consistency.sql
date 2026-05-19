-- ============================================================================
-- CLEANUP & CONSISTENCY: BUG-12, H11, DT-14
-- ============================================================================

-- 1) Garante coluna avatar_url em profiles.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- 2) project_members é tabela legada — coexiste com project_enrollments
--    sem propósito claro. Não dropamos aqui (caso haja dados em produção),
--    mas trancamos com RLS restritiva pra que nada novo escreva nela.
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_members', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "project_members_admin_only"
  ON public.project_members
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.project_members IS
  'DEPRECATED: Use project_enrollments. Esta tabela existe apenas para compatibilidade temporária e será removida em migration futura.';
