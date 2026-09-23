'use client'

import { useState, useEffect, useRef } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  width?: number
  height?: number
  className?: string
  onLoad?: () => void
}

export default function LazyImage({
  src,
  alt,
  placeholder,
  width,
  height,
  className = '',
  onLoad,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            imgRef.current.src = src
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [src])

  return (
    <div className="relative overflow-hidden bg-gray-100">
      {!loaded && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          width={width}
          height={height}
          className={`${className} blur-md`}
        />
      )}
      <img
        ref={imgRef}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => {
          setLoaded(true)
          onLoad?.()
        }}
        onError={() => setError(true)}
      />
      {error && (
        <div className="flex items-center justify-center h-full bg-gray-200">
          <span className="text-gray-500">画像を読み込めません</span>
        </div>
      )}
    </div>
  )
}
