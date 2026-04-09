
-- Add is_approved column to profiles
ALTER TABLE public.profiles ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Auto-approve existing users
UPDATE public.profiles SET is_approved = true;

-- Create a security definer function to check approval
CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_approved FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- Update favorites policies to require approval
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
CREATE POLICY "Users can add favorites" ON public.favorites
FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_approved(auth.uid()));

DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;
CREATE POLICY "Users can remove favorites" ON public.favorites
FOR DELETE USING (auth.uid() = user_id AND public.is_approved(auth.uid()));

-- Update messages policy to require approval for sending
DROP POLICY IF EXISTS "Anyone can send messages" ON public.messages;
CREATE POLICY "Approved users can send messages" ON public.messages
FOR INSERT WITH CHECK (public.is_approved(auth.uid()));

-- Update properties insert policy to require approval
DROP POLICY IF EXISTS "Agents can create properties" ON public.properties;
CREATE POLICY "Approved agents can create properties" ON public.properties
FOR INSERT WITH CHECK (
  auth.uid() = created_by 
  AND public.is_approved(auth.uid())
  AND (has_role(auth.uid(), 'agent'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);
