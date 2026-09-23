'use client'

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  ariaLabel?: string
  ariaDescribedBy?: string
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function AccessibleButton({
  children,
  ariaLabel,
  ariaDescribedBy,
  isLoading,
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: AccessibleButtonProps) {
  const baseStyle =
    'py-3 px-4 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles: Record<string, string> = {
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400 disabled:bg-emerald-300',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400 disabled:bg-red-300',
  }

  return (
    <button
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={isLoading}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variantStyles[variant]} ${className} ${
        isLoading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          処理中…
        </span>
      ) : (
        children
      )}
    </button>
  )
}
