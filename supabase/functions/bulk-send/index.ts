import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authErr || !user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  if (profile?.tier !== 'pro' && profile?.tier !== 'admin') {
    return new Response(JSON.stringify({ error: 'PRO tier required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json() as {
    subject: string
    message: string
    customerIds?: string[]
  }

  const query = supabase.from('customers').select('id, name, email').eq('user_id', user.id)
  if (body.customerIds?.length) {
    query.in('id', body.customerIds)
  }
  const { data: customers, error: custErr } = await query
  if (custErr) throw custErr

  const targets = (customers ?? []).filter((c) => c.email)
  let sent = 0

  for (const c of targets) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bitnal <noreply@bitnal.com>',
        to: [c.email],
        subject: body.subject,
        text: `${c.name}님,\n\n${body.message}\n\n-Bitnal`,
      }),
    })
    if (res.ok) sent++
  }

  return new Response(JSON.stringify({ sent, total: targets.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
