
-- First, let's check if the constraints exist and drop them if they do
ALTER TABLE public.forum_posts DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;
ALTER TABLE public.forum_comments DROP CONSTRAINT IF EXISTS forum_comments_author_id_fkey;

-- Now create the proper foreign key constraints
ALTER TABLE public.forum_posts 
ADD CONSTRAINT forum_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.forum_comments
ADD CONSTRAINT forum_comments_author_id_fkey
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
