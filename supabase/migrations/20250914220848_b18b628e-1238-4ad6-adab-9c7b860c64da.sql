-- Check if trigger exists and create profile auto-creation trigger
-- This ensures every new user gets a profile automatically

-- Create trigger to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name,
    preferred_mode,
    voice_feedback_enabled,
    wake_phrase,
    microphone_sensitivity
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'personal',
    true,
    'Hey SpeakEasy',
    0.8
  );
  RETURN NEW;
END;
$$;

-- Create the trigger (will replace if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();