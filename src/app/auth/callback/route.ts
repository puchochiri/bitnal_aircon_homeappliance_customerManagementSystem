import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const supabase = await createServerClient()
  const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code)

  if (!sessionData.user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Check if user has completed onboarding (country_code set)
  const { data: profile } = await supabase
    .from('users')
    .select('country_code')
    .eq('id', sessionData.user.id)
    .single()

  const needsOnboarding = !profile?.country_code

  return NextResponse.redirect(`${origin}${needsOnboarding ? '/onboarding' : '/dashboard'}`)
}
