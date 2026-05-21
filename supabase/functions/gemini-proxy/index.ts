import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const ALLOWED_ORIGINS = [
  'https://bitnal.com',
  'http://localhost:3000',
]

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  const origin = req.headers.get('origin') ?? ''
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { ...CORS_HEADERS, 'Access-Control-Allow-Origin': corsOrigin },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin },
    })
  }

  let body: { prompt?: string; context?: string; maxTokens?: number }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin },
    })
  }

  if (!body.prompt || body.prompt.length > 2000) {
    return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin },
    })
  }

  const systemContext = body.context ?? ''
  const fullPrompt = systemContext
    ? `Context: ${systemContext}\n\nUser: ${body.prompt}`
    : body.prompt

  const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: body.maxTokens ?? 1024,
        temperature: 0.7,
      },
    }),
  })

  if (!geminiRes.ok) {
    const err = await geminiRes.text()
    return new Response(JSON.stringify({ error: 'Gemini API error', details: err }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin },
    })
  }

  const data = await geminiRes.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin },
  })
})
