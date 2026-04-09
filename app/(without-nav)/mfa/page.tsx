'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MFAPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(59)
  const [canResend, setCanResend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef([])
  const router = useRouter()

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer, canResend])

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Take only last character
    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (fullCode) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/mfa/verify-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fullCode })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Invalid verification code')
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err.message)
      // Clear inputs on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/mfa/resend', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to resend code')
      
      setTimer(59)
      setCanResend(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
         style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-neutral-dark) 100%)' }}>
      
      <div className="w-full max-w-md p-8 md:p-10 rounded-xl shadow-2xl space-y-8"
           style={{ 
             backgroundColor: 'var(--color-neutral-light)',
             boxShadow: '0 25px 50px -12px rgba(20, 30, 48, 0.25)'
           }}>
        
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
               style={{ 
                 backgroundColor: 'var(--color-primary-dark)',
                 color: 'var(--color-neutral-light)'
               }}>
            <svg xmlns="http://www.w3.org/2000/svg" 
                 className="w-6 h-6" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor"
                 strokeWidth={2}>
              <path strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-primary-dark)' }}>
            Secure Your Account
          </h1>
          
          <p className="leading-relaxed" style={{ color: 'var(--color-neutral-dark)' }}>
            Please enter the 6-digit verification code sent to your student email{' '}
            <span className="font-semibold" style={{ color: 'var(--color-primary-light)' }}>
              (j.doe@university.edu)
            </span>.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg text-center text-sm font-medium"
               style={{ 
                 backgroundColor: 'rgba(229, 62, 62, 0.1)',
                 color: 'var(--color-error)'
               }}>
            {error}
          </div>
        )}

        {/* Code Input Area */}
        <form onSubmit={(e) => {
          e.preventDefault()
          handleVerify(code.join(''))
        }} className="space-y-8">
          
          <div className="flex justify-between gap-2 md:gap-4">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: digit ? 'var(--color-accent)' : 'transparent',
                  color: 'var(--color-primary-dark)'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'var(--color-neutral-light)'
                  e.target.style.borderColor = 'var(--color-primary-light)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(63, 94, 150, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'var(--color-secondary)'
                  e.target.style.borderColor = digit ? 'var(--color-accent)' : 'transparent'
                  e.target.style.boxShadow = 'none'
                }}
              />
            ))}
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 6}
            className="w-full py-4 rounded-lg font-semibold text-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-light) 100%)',
              color: 'var(--color-neutral-light)',
              boxShadow: '0 10px 25px -5px rgba(20, 30, 48, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'scale(1.02)'
                e.target.style.boxShadow = '0 15px 30px -5px rgba(20, 30, 48, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 10px 25px -5px rgba(20, 30, 48, 0.3)'
            }}
            onMouseDown={(e) => {
              if (!isLoading) e.target.style.transform = 'scale(0.98)'
            }}
            onMouseUp={(e) => {
              if (!isLoading) e.target.style.transform = 'scale(1.02)'
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </form>

        {/* Secondary Options */}
        <div className="flex flex-col items-center space-y-4 pt-4">
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: 'var(--color-neutral-dark)' }}>Didn't receive a code?</span>
            <button
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className="font-semibold transition-opacity disabled:cursor-not-allowed"
              style={{ 
                color: canResend ? 'var(--color-primary-light)' : 'var(--color-secondary)',
                opacity: canResend ? 1 : 0.5
              }}
            >
              {canResend ? 'Resend Code' : `Resend Code (in ${formatTime(timer)})`}
            </button>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.3 }}></div>

          <button
            onClick={() => router.push('/login')}
            className="font-medium hover:underline flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--color-primary-light)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" 
                 className="w-4 h-4" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Try another method
          </button>
        </div>
      </div>
    </div>
  )
}
