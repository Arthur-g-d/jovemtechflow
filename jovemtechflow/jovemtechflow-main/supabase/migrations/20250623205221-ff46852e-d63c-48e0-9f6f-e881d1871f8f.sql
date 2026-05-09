
-- Adicionar campos para controle de inscrições nos projetos
ALTER TABLE public.projects 
ADD COLUMN max_enrollments integer,
ADD COLUMN enrollment_status text DEFAULT 'open' CHECK (enrollment_status IN ('open', 'closed'));

-- Criar tabela para inscrições em projetos (diferente de project_members que é para admins adicionarem)
CREATE TABLE public.project_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  enrolled_by_admin boolean DEFAULT false,
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.project_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for project_enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.project_enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
  ON public.project_enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND enrolled_by_admin = false);

CREATE POLICY "Admins can manage all enrollments"
  ON public.project_enrollments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Atualizar a tabela de profiles para incluir email
ALTER TABLE public.profiles 
ADD COLUMN email text;

-- Função para buscar usuário por email
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
RETURNS table(user_id uuid, username text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.email
  FROM public.profiles p
  WHERE p.email = user_email;
END;
$$;
