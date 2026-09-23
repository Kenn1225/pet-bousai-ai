'use client'

import { useEffect, useState } from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error:', event.error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">エラーが発生しました</h1>
          <p className="text-red-600 mb-6">申し訳ございません。ページを再読み込みしてください。</p>
          <button
            onClick={() => location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
