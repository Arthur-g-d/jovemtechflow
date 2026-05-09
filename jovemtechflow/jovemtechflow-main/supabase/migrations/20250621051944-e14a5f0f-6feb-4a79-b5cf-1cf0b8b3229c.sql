
-- Criar tabela de módulos para organizar o conteúdo em seções
CREATE TABLE public.project_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar referência de módulo à tabela de conteúdos existente
ALTER TABLE public.project_contents 
ADD COLUMN module_id UUID REFERENCES public.project_modules(id) ON DELETE CASCADE;

-- Adicionar campos necessários para um sistema de módulos completo
ALTER TABLE public.project_contents 
ADD COLUMN content_text TEXT,
ADD COLUMN is_required BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;

-- Atualizar progressões para incluir referência ao módulo
ALTER TABLE public.project_progressions 
ADD COLUMN module_id UUID REFERENCES public.project_modules(id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX idx_project_modules_project_id ON public.project_modules(project_id);
CREATE INDEX idx_project_contents_module_id ON public.project_contents(module_id);
CREATE INDEX idx_project_progressions_module_id ON public.project_progressions(module_id);

-- Função para calcular progresso por módulo
CREATE OR REPLACE FUNCTION public.calculate_module_progress(
  p_user_id UUID,
  p_module_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_contents INTEGER;
  completed_contents INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Contar total de conteúdos no módulo
  SELECT COUNT(*) INTO total_contents
  FROM public.project_contents
  WHERE module_id = p_module_id;
  
  -- Se não há conteúdos, retornar 0%
  IF total_contents = 0 THEN
    RETURN 0;
  END IF;
  
  -- Contar conteúdos completados pelo usuário
  SELECT COUNT(*) INTO completed_contents
  FROM public.project_contents pc
  JOIN public.project_progressions pp ON pc.id = pp.content_id
  WHERE pc.module_id = p_module_id 
    AND pp.user_id = p_user_id 
    AND pp.progress_num >= 100;
  
  -- Calcular porcentagem
  progress_percentage := ROUND((completed_contents::DECIMAL / total_contents::DECIMAL) * 100);
  
  RETURN progress_percentage;
END;
$$;

-- Função para calcular progresso geral do projeto
CREATE OR REPLACE FUNCTION public.calculate_project_progress(
  p_user_id UUID,
  p_project_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_modules INTEGER;
  completed_modules INTEGER;
  progress_percentage INTEGER;
BEGIN
  -- Contar total de módulos no projeto
  SELECT COUNT(*) INTO total_modules
  FROM public.project_modules
  WHERE project_id = p_project_id;
  
  -- Se não há módulos, retornar 0%
  IF total_modules = 0 THEN
    RETURN 0;
  END IF;
  
  -- Contar módulos com 100% de progresso
  SELECT COUNT(*) INTO completed_modules
  FROM public.project_modules pm
  WHERE pm.project_id = p_project_id
    AND public.calculate_module_progress(p_user_id, pm.id) >= 100;
  
  -- Calcular porcentagem
  progress_percentage := ROUND((completed_modules::DECIMAL / total_modules::DECIMAL) * 100);
  
  RETURN progress_percentage;
END;
$$;
