'use client'

import { useState, useCallback } from 'react'

interface FormInputProps {
  label: string
  type?: 'text' | 'number' | 'email' | 'tel'
  placeholder?: string
  value: string | number
  onChange: (value: string | number) => void
  required?: boolean
  error?: string
  validator?: (value: string | number) => string | null
  helpText?: string
}

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  error,
  validator,
  helpText,
}: FormInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = type === 'number' ? Number(e.target.value) : e.target.value
      onChange(newValue)

      if (validator && touched) {
        const result = validator(newValue)
        setValidationError(result)
      }
    },
    [onChange, validator, touched, type]
  )

  const handleBlur = useCallback(() => {
    setTouched(true)
    if (validator) {
      const result = validator(value)
      setValidationError(result)
    }
  }, [validator, value])

  const displayError = validationError || error

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
          displayError
            ? 'border-red-300 focus:ring-red-400'
            : 'border-gray-300 focus:ring-emerald-400'
        }`}
      />
      {displayError && (
        <p className="text-xs text-red-600 mt-1">⚠️ {displayError}</p>
      )}
      {helpText && !displayError && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  )
}
