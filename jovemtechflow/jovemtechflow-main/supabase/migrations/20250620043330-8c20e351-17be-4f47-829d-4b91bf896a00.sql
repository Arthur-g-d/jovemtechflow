
-- Create project_members table to track which users are enrolled in which projects
CREATE TABLE public.project_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Create policies for project_members
CREATE POLICY "Users can view project memberships"
  ON public.project_members
  FOR SELECT
  USING (true);

CREATE POLICY "Users can join projects"
  ON public.project_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave projects"
  ON public.project_members
  FOR DELETE
  USING (auth.uid() = user_id);
