'use client'

import { pdf } from '@react-pdf/renderer'
import { generatePdfDocument } from '@/lib/generatePdf'
import type { DiagnosisReport, RiskScores } from '@/lib/types'

interface PDFDownloadButtonProps {
  report: DiagnosisReport
  scores: RiskScores
  petName?: string
}

export default function PDFDownloadButton({ report, scores, petName }: PDFDownloadButtonProps) {
  const handleDownloadPdf = async () => {
    try {
      alert('現在、PDF生成機能はメンテナンス中です。申し訳ございません。')
      return

      const doc = generatePdfDocument({
        report,
        scores,
        petName,
        generatedAt: new Date().toLocaleString('ja-JP'),
      })

      const blob = await pdf(doc as any).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pet-bousai-${petName || 'report'}-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF生成エラー:', error)
      alert('PDFの生成に失敗しました。')
    }
  }

  return (
    <button
      onClick={handleDownloadPdf}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
    >
      <span>📄</span>
      <span>PDFをダウンロード</span>
    </button>
  )
}
