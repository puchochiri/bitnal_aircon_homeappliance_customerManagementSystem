import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Called daily via pg_cron: SELECT cron.schedule('cleanup-expired', '0 3 * * *', ...);
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const results: Record<string, number> = {}

  // Downgrade users whose subscription_expires_at has passed
  const now = new Date().toISOString()
  const { data: expired, error: expiredErr } = await supabase
    .from('users')
    .select('id')
    .eq('tier', 'pro')
    .lt('subscription_expires_at', now)

  if (!expiredErr && expired?.length) {
    const ids = expired.map((u: { id: string }) => u.id)
    await supabase.from('users').update({ tier: 'free' }).in('id', ids)
    results.downgradedUsers = ids.length
  }

  // Delete soft-deleted records older than 30 days (if soft-delete pattern is used)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: oldLogs } = await supabase
    .from('work_logs')
    .select('id')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff)

  if (oldLogs?.length) {
    const ids = oldLogs.map((r: { id: string }) => r.id)
    await supabase.from('work_logs').delete().in('id', ids)
    results.deletedWorkLogs = ids.length
  }

  // Clean up orphaned sync_queue entries older than 7 days
  const syncCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: deletedSync } = await supabase
    .from('sync_queue')
    .delete({ count: 'exact' })
    .lt('created_at', syncCutoff)

  results.deletedSyncQueue = deletedSync ?? 0

  return new Response(JSON.stringify({ ok: true, ...results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
