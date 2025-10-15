-- Drop the existing SELECT policy to replace with a more secure one
DROP POLICY IF EXISTS "Only admins can view waitlist data" ON public.waitlist;

-- Create a more explicit and secure SELECT policy that clearly blocks all public access
CREATE POLICY "Block all public access to waitlist data" 
ON public.waitlist 
FOR SELECT 
USING (
  -- Explicitly require authentication
  auth.uid() IS NOT NULL 
  AND 
  -- Only allow admin role
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add a security function to log unauthorized access attempts
CREATE OR REPLACE FUNCTION public.log_waitlist_unauthorized_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log suspicious access attempts to waitlist
  INSERT INTO public.security_alerts (
    alert_type,
    severity,
    user_id,
    details
  ) VALUES (
    'unauthorized_waitlist_access_attempt',
    'high',
    auth.uid(),
    jsonb_build_object(
      'timestamp', now(),
      'ip_address', inet_client_addr(),
      'user_id', auth.uid()
    )
  );
END;
$$;