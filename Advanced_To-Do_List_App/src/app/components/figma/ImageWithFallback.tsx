import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

type Status = 'loading' | 'loaded' | 'error'

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Second image to try before showing the placeholder (e.g. a smaller or local copy). */
  fallbackSrc?: string
  /** Custom placeholder content shown instead of the default icon when everything fails. */
  fallback?: React.ReactNode
  /** Fade the image in once it has loaded, over a soft placeholder. Defaults to true. */
  fadeIn?: boolean
  /** Show a "Retry" button on the placeholder. */
  retryable?: boolean
}

export const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  function ImageWithFallback(
    {
      src,
      alt,
      style,
      className,
      fallbackSrc,
      fallback,
      fadeIn = true,
      retryable = false,
      loading = 'lazy',
      decoding = 'async',
      onError,
      onLoad,
      width,
      height,
      ...rest
    },
    forwardedRef,
  ) {
    const imgRef = useRef<HTMLImageElement>(null)
    useImperativeHandle(forwardedRef, () => imgRef.current as HTMLImageElement)

    const [status, setStatus] = useState<Status>('loading')
    const [usingFallback, setUsingFallback] = useState(false)
    const [attempt, setAttempt] = useState(0) // bumped by Retry to force a reload

    const currentSrc = usingFallback && fallbackSrc ? fallbackSrc : src

    // A new src starts a fresh attempt. (Previously, one failure stuck forever,
    // even after the parent passed a working URL.)
    useEffect(() => {
      setStatus('loading')
      setUsingFallback(false)
    }, [src])

    // Cached images can finish (or fail) before React attaches handlers.
    useEffect(() => {
      const img = imgRef.current
      if (!img || !img.complete) return
      if (img.naturalWidth > 0) setStatus('loaded')
      else if (currentSrc) handleFailure()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSrc, attempt])

    const handleFailure = useCallback(() => {
      if (!usingFallback && fallbackSrc && fallbackSrc !== src) {
        setUsingFallback(true)
        setStatus('loading')
      } else {
        setStatus('error')
      }
    }, [usingFallback, fallbackSrc, src])

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      onError?.(e) // the old version silently dropped the caller's onError
      handleFailure()
    }

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setStatus('loaded')
      onLoad?.(e)
    }

    const retry = () => {
      setUsingFallback(false)
      setStatus('loading')
      setAttempt((n) => n + 1)
    }

    if (status === 'error' || !currentSrc) {
      return (
        <div
          role="img"
          aria-label={alt || 'Image failed to load'}
          data-original-url={src}
          className={`inline-flex flex-col items-center justify-center gap-2 bg-gray-100 text-center align-middle dark:bg-gray-800 ${className ?? ''}`}
          style={{ width, height, ...style }}
        >
          {fallback ?? (
            <img src={ERROR_IMG_SRC} alt="" aria-hidden="true" className="max-h-full max-w-full opacity-80 dark:invert" />
          )}
          {retryable && src && (
            <button
              type="button"
              onClick={retry}
              className="rounded px-2 py-0.5 text-xs text-gray-600 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Retry
            </button>
          )}
        </div>
      )
    }

    const loadedClasses = fadeIn
      ? `transition-opacity duration-300 motion-reduce:transition-none ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`
      : ''

    return (
      <img
        {...rest}
        // Changing the key makes the browser retry the request on "Retry".
        key={`${currentSrc}-${attempt}`}
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        className={`${className ?? ''} ${loadedClasses}`.trim()}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
      />
    )
  },
)
