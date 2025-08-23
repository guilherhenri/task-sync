import '../../styles/components/_toast.scss'

import { Check, Warn, X } from '@task-sync/icons'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'

export interface ToastData {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning'
  duration?: number
}

export interface ToastProps extends ToastData {
  onRemove: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'success',
  duration = 4000,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 10)

    const removeTimer = setTimeout(() => {
      setIsRemoving(true)
      setTimeout(() => onRemove(id), 300)
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(removeTimer)
    }
  }, [id, duration, onRemove])

  const handleClose = () => {
    setIsRemoving(true)
    setTimeout(() => onRemove(id), 300)
  }

  function getIconByType(
    type: ToastData['type'],
  ): React.JSX.Element | undefined {
    switch (type) {
      case 'success':
        return <Check role="img" aria-hidden="true" />
      case 'warning':
        return <Warn role="img" aria-hidden="true" />
      case 'error':
        return <X role="img" aria-hidden="true" />
    }
  }

  return (
    <div
      className={clsx('toast', `toast--${type}`, {
        'toast--visible': isVisible && !isRemoving,
        'toast--removing': isRemoving,
      })}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      aria-describedby={`toast-message-${id}`}
    >
      <div className="toast__content">
        <div className="toast__icon">
          <div
            className={clsx('toast__indicator', `toast__indicator--${type}`)}
            aria-hidden="true"
          >
            {getIconByType(type)}
          </div>
        </div>
        <span id={`toast-message-${id}`} className="toast__message">
          {message}
        </span>
        <button
          className="toast__close"
          type="button"
          onClick={handleClose}
          aria-label="Fechar notificação"
        >
          <X className="toast__close-icon" role="img" aria-hidden="true" />
        </button>
      </div>
      <div
        className={clsx('toast__glow', `toast__glow--${type}`)}
        aria-hidden="true"
      />
    </div>
  )
}
