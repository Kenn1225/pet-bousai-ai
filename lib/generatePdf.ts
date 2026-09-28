import type { DiagnosisReport, RiskScores } from './types'

export interface PdfDataProps {
  report: DiagnosisReport
  scores: RiskScores
  petName?: string
  generatedAt?: string
}

// Turbopack互換性問題のため、この機能は現在無効化されています
export function generatePdfDocument(data: PdfDataProps) {
  console.log('PDF生成機能は現在利用できません', data)
  return null
}
