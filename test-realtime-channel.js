// Test Supabase Realtime Channel for Device Events
// This script subscribes to device events and listens for INSERT/UPDATE/DELETE broadcasts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zofxbilhjehbtlbtence.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZnhiaWxoamVoYnRsYnRlbmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDgxNzUsImV4cCI6MjA3MDA4NDE3NX0.i9pptWJqA9AMKw0MubKeqwxI14x5Pb1aLSmP2NXMgBc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRealtimeChannel() {
  console.log('🔌 Testing Supabase Realtime Channel...\n')

  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('❌ Error getting session:', sessionError.message)
    console.log('⚠️  You need to be logged in. Please sign in to the app first.')
    return
  }

  if (!session) {
    console.log('⚠️  No active session found.')
    console.log('📝 Please sign in to the app at http://localhost:5173 first')
    return
  }

  console.log('✅ Session found for:', session.user.email)

  // Set auth for realtime
  await supabase.realtime.setAuth(session?.access_token)

  // Get the most recent device for this user
  const { data: devices, error: deviceError } = await supabase
    .from('devices')
    .select('id, name')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (deviceError) {
    console.error('❌ Error fetching device:', deviceError.message)
    return
  }

  if (!devices || devices.length === 0) {
    console.log('⚠️  No devices found for your user.')
    console.log('📝 Run the SQL script to create a test device first.')
    return
  }

  const deviceId = devices[0].id
  console.log(`✅ Using device: ${devices[0].name} (${deviceId})\n`)

  // Create realtime channel
  const channel = supabase.channel(`device:${deviceId}:events`, {
    config: { private: true, broadcast: { ack: true } }
  })

  console.log('📡 Subscribing to realtime events...\n')

  channel
    .on('broadcast', { event: 'INSERT' }, (msg) => {
      console.log('📥 INSERT event received:', JSON.stringify(msg.payload, null, 2))
    })
    .on('broadcast', { event: 'UPDATE' }, (msg) => {
      console.log('📝 UPDATE event received:', JSON.stringify(msg.payload, null, 2))
    })
    .on('broadcast', { event: 'DELETE' }, (msg) => {
      console.log('🗑️  DELETE event received:', JSON.stringify(msg.payload, null, 2))
    })
    .subscribe((status) => {
      console.log('🔔 Channel status:', status)
      
      if (status === 'SUBSCRIBED') {
        console.log('\n✅ Successfully subscribed to device events!')
        console.log(`📺 Listening for events on device: ${deviceId}`)
        console.log('\n💡 To trigger an event, run this SQL in Supabase editor:')
        console.log(`INSERT INTO public.device_events (device_id, event_type, payload)`)
        console.log(`VALUES ('${deviceId}', 'test_event', '{"message":"test from console"}'::jsonb);`)
        console.log('\n⌨️  Press Ctrl+C to stop listening...\n')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error - check your permissions and device ID')
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Connection timed out')
      }
    })

  // Keep the script running
  console.log('⏳ Waiting for events...\n')
}

// Run the test
testRealtimeChannel().catch(console.error)

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing realtime connection...')
  process.exit(0)
})
