import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

function verifyTossAuth(authHeader: string): boolean {
  if (!authHeader.startsWith('Basic ')) return false
  const encoded = authHeader.slice(6)
  const decoded = atob(encoded)
  const expectedKey = `${TOSS_SECRET_KEY}:`
  return decoded === expectedKey
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (TOSS_SECRET_KEY && !verifyTossAuth(authHeader)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = await req.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const eventType = event.eventType as string
  const data = event.data as Record<string, unknown> | undefined

  // Toss billing webhook
  if (eventType === 'PAYMENT_STATUS_CHANGED') {
    const status = (data?.status as string) ?? ''
    const metadata = (data?.metadata as Record<string, string>) ?? {}
    const userId = metadata?.user_id

    if (!userId) {
      return new Response('Missing user_id in metadata', { status: 422 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (status === 'DONE') {
      await supabase.from('users').update({ tier: 'pro' }).eq('id', userId)
    } else if (status === 'CANCELED' || status === 'ABORTED') {
      await supabase.from('users').update({ tier: 'free' }).eq('id', userId)
    }
  }

  return new Response('OK', { status: 200 })
})
