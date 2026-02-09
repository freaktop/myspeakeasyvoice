-- Insert Test Device for SpeakEasy
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zofxbilhjehbtlbtence/editor

-- STEP 1: Insert test device for most recent user
INSERT INTO public.devices (owner_id, name)
SELECT id, 'Test Device'
FROM auth.users
ORDER BY created_at DESC
LIMIT 1
RETURNING id, owner_id, name;

-- STEP 2: Insert device member (makes the user an owner of the device)
-- This automatically uses the most recent device and user
INSERT INTO public.device_members (device_id, user_id, role)
SELECT d.id, u.id, 'owner'
FROM public.devices d
CROSS JOIN auth.users u
WHERE d.owner_id = u.id
ORDER BY d.created_at DESC
LIMIT 1
RETURNING device_id, user_id, role;

-- OR run ALL THREE steps together in one transaction:
BEGIN;

WITH new_device AS (
  INSERT INTO public.devices (owner_id, name)
  SELECT id, 'Test Device'
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1
  RETURNING id, owner_id
),
new_member AS (
  INSERT INTO public.device_members (device_id, user_id, role)
  SELECT id, owner_id, 'owner'
  FROM new_device
  RETURNING device_id, user_id, role
)
INSERT INTO public.device_events (device_id, event_type, payload)
SELECT device_id, 'test_event', '{"message":"hello from trigger"}'::jsonb
FROM new_member
RETURNING id, device_id, event_type, payload;

COMMIT;
