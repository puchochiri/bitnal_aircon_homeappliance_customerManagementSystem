import { supabase } from '@/lib/supabase/client'

export interface AiRequest {
  prompt: string
  context?: string
  maxTokens?: number
}

export async function askAI(request: AiRequest): Promise<string> {
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: request,
  })
  if (error) throw error
  return (data as { text: string }).text
}

export function buildWorkReportPrompt(params: {
  customerName: string
  applianceType: string
  brand?: string | null
  workType: string
  date: string
}): string {
  return `다음 작업에 대한 간결한 작업 완료 보고서를 3문장으로 작성해주세요.

고객명: ${params.customerName}
가전 종류: ${params.applianceType}
브랜드: ${params.brand ?? '미상'}
작업 유형: ${params.workType}
작업 날짜: ${params.date}

보고서는 고객에게 SMS나 카카오톡으로 전송할 수 있는 형태로 작성해주세요.`
}

export function buildMaintenanceSuggestionPrompt(appliances: Array<{
  type: string
  brand?: string | null
  installDate?: string | null
  lastWorkDate?: string | null
}>): string {
  const list = appliances.map((a) =>
    `- ${a.type} (${a.brand ?? '미상'}) / 설치: ${a.installDate ?? '미상'} / 마지막 작업: ${a.lastWorkDate ?? '없음'}`
  ).join('\n')

  return `다음 가전 목록을 보고 유지보수가 필요한 항목과 권장 시기를 간결하게 알려주세요:

${list}

각 항목에 대해 한 줄로 요약해주세요.`
}
