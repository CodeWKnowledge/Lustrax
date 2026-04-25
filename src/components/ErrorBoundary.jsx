import React from 'react'

/**
 * ErrorBoundary
 * Catches any unhandled JavaScript errors thrown by child components
 * and renders a graceful fallback UI instead of a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    // In production you would send this to a monitoring service (e.g. Sentry)
    // For now, we just suppress the console noise from swallowed errors
    if (import.meta.env.DEV) {
      console.error('[Lustrax ErrorBoundary]', error, info)
    }
  }

  handleReset() {
    this.setState({ hasError: false, errorMessage: '' })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 space-y-10 text-center">
          {/* Subtle glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-red-500/[0.03] blur-[120px]" />
          </div>

          <div className="space-y-6 max-w-md relative z-10">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full border border-red-100 bg-red-50 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="space-y-3">
              <h1 className="text-xl font-playfair font-bold text-charcoal tracking-tight">
                Something Went Wrong
              </h1>
              <p className="text-sm text-gray-400 font-inter leading-relaxed">
                An unexpected error occurred. Your session and cart data are safe.
                Please return to the boutique to continue.
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center space-x-4">
              <span className="h-px w-10 bg-gold/30" />
              <span className="text-gold text-[9px] font-inter tracking-[0.3em] uppercase">Lustrax</span>
              <span className="h-px w-10 bg-gold/30" />
            </div>

            <button
              onClick={() => this.handleReset()}
              className="inline-flex items-center justify-center h-12 px-10 bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-charcoal/80 transition-all duration-300"
            >
              Return to Boutique
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary


