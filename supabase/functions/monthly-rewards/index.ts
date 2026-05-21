import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Called monthly via pg_cron: SELECT cron.schedule('monthly-rewards', '0 0 1 * *', $$SELECT supabase_functions.http_post(...)$$);
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Find PRO users who logged at least one work entry last month
  const now = new Date()
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: activeUsers, error: fetchErr } = await supabase
    .from('work_logs')
    .select('user_id')
    .gte('worked_at', firstOfLastMonth)
    .lt('worked_at', firstOfThisMonth)

  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500 })
  }

  const uniqueUserIds = [...new Set((activeUsers ?? []).map((r: { user_id: string }) => r.user_id))]

  // Award 100 points each
  const POINTS_REWARD = 100
  let rewarded = 0

  for (const userId of uniqueUserIds) {
    const { error: upsertErr } = await supabase.rpc('add_user_points', {
      p_user_id: userId,
      p_delta: POINTS_REWARD,
      p_reason: `monthly_activity_${firstOfLastMonth.slice(0, 7)}`,
    })
    if (!upsertErr) rewarded++
  }

  return new Response(
    JSON.stringify({ rewarded, total: uniqueUserIds.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
