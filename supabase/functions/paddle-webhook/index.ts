import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PADDLE_WEBHOOK_SECRET = Deno.env.get('PADDLE_WEBHOOK_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

async function verifyPaddleSignature(
  body: string,
  signatureHeader: string
): Promise<boolean> {
  const parts = Object.fromEntries(
    signatureHeader.split(';').map((p) => p.split('=') as [string, string])
  )
  const ts = parts['ts']
  const h1 = parts['h1']
  if (!ts || !h1) return false

  const payload = `${ts}:${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PADDLE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return computed === h1
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const body = await req.text()
  const signatureHeader = req.headers.get('Paddle-Signature') ?? ''

  if (PADDLE_WEBHOOK_SECRET && !(await verifyPaddleSignature(body, signatureHeader))) {
    return new Response('Unauthorized', { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const eventType = event.event_type as string
  const data = event.data as Record<string, unknown>
  const customData = data?.custom_data as Record<string, string> | undefined
  const userId = customData?.user_id

  if (!userId) {
    return new Response('Missing user_id in custom_data', { status: 422 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  if (
    eventType === 'subscription.activated' ||
    eventType === 'subscription.updated'
  ) {
    const status = (data?.status as string) ?? ''
    const tier = status === 'active' || status === 'trialing' ? 'pro' : 'free'
    await supabase.from('users').update({ tier }).eq('id', userId)
  } else if (
    eventType === 'subscription.cancelled' ||
    eventType === 'subscription.past_due'
  ) {
    await supabase.from('users').update({ tier: 'free' }).eq('id', userId)
  }

  return new Response('OK', { status: 200 })
})
