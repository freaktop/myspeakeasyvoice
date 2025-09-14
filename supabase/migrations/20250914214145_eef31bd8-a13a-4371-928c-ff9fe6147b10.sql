-- Fix waitlist RLS policy to use proper role checking
-- Drop the existing faulty policy
DROP POLICY IF EXISTS "Admins can view waitlist securely" ON public.waitlist;

-- Create a proper SELECT policy that uses the has_role function
CREATE POLICY "Only admins can view waitlist data" 
ON public.waitlist 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Also ensure we have a proper policy for updates (currently missing)
CREATE POLICY "Only admins can update waitlist data" 
ON public.waitlist 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));