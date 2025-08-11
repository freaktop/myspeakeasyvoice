-- Add missing DELETE policies for user data management

-- Add DELETE policy for app_integrations table
CREATE POLICY "Users can delete their own integrations" 
ON public.app_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add DELETE policy for voice_settings table  
CREATE POLICY "Users can delete their own voice settings"
ON public.voice_settings
FOR DELETE
USING (auth.uid() = user_id);