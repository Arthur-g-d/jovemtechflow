-- Add admin delete policies for forum comments
CREATE POLICY "Admins can delete any comment"
ON public.forum_comments
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add admin delete policies for forum posts
CREATE POLICY "Admins can delete any post"
ON public.forum_posts
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));