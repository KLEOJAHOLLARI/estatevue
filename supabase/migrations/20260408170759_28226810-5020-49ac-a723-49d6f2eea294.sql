
-- Drop existing FKs pointing to auth.users
ALTER TABLE public.properties DROP CONSTRAINT properties_created_by_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;

-- Recreate FKs pointing to profiles.user_id
ALTER TABLE public.properties
  ADD CONSTRAINT properties_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
