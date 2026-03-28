
-- 1. Server-side content moderation trigger for posts AND comments
CREATE OR REPLACE FUNCTION public.moderate_community_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF lower(NEW.content) ~ '(kill|suicide|self.harm|cut myself|end my life|die|hate you|kys|worthless|hang myself|overdose|abuse|violent|assault|threat|bully)'
     OR (TG_TABLE_NAME = 'peer_support_posts' AND lower(NEW.title) ~ '(kill|suicide|self.harm|cut myself|end my life|die|hate you|kys|worthless|hang myself|overdose|abuse|violent|assault|threat|bully)') THEN
    NEW.is_flagged = true;
    IF TG_TABLE_NAME = 'peer_support_posts' THEN
      NEW.is_moderated = false;
    END IF;
  ELSE
    NEW.is_flagged = false;
    IF TG_TABLE_NAME = 'peer_support_posts' THEN
      NEW.is_moderated = true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER moderate_posts_before_insert
  BEFORE INSERT ON public.peer_support_posts
  FOR EACH ROW EXECUTE FUNCTION public.moderate_community_content();

CREATE TRIGGER moderate_comments_before_insert
  BEFORE INSERT ON public.peer_support_comments
  FOR EACH ROW EXECUTE FUNCTION public.moderate_community_content();

-- 2. Create a view that hides author_id for anonymous posts
CREATE OR REPLACE VIEW public.peer_support_posts_safe AS
SELECT
  id,
  CASE WHEN is_anonymous = true THEN NULL ELSE author_id END AS author_id,
  title,
  content,
  is_anonymous,
  is_flagged,
  is_moderated,
  likes_count,
  comments_count,
  tags,
  pseudo_id,
  created_at,
  updated_at
FROM public.peer_support_posts;

-- 3. Restrict counselor access to assessments - only for their patients (via appointments)
DROP POLICY IF EXISTS "Counselors can view assessments" ON public.psychological_assessments;

CREATE POLICY "Counselors can view assigned patient assessments"
ON public.psychological_assessments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'counselor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.counselor_profiles cp ON cp.id = a.counselor_id
    WHERE cp.user_id = auth.uid()
    AND a.student_id = psychological_assessments.user_id
  )
);
