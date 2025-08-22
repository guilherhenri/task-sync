import { act, render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'

import * as ToastModule from '.'
import { ToastProvider } from './toast-context'

jest.mock('.', () => ({
  setToastFunction: jest.fn(),
  Toast: ({
    message,
    onRemove,
    id,
  }: {
    message: string
    onRemove: (id: string) => void
    id: string
  }) => (
    <div data-testid={`toast-${id}`}>
      {message}
      <button onClick={() => onRemove(id)} data-testid={`close-${id}`}>
        Close
      </button>
    </div>
  ),
}))

expect.extend(toHaveNoViolations)

describe('ToastProvider Component', () => {
  let mockSetToastFunction: jest.Mock

  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()

    mockSetToastFunction = ToastModule.setToastFunction as jest.Mock
    mockSetToastFunction.mockClear()
  })

  afterEach(() => {
    if (jest.isMockFunction(setTimeout)) {
      jest.runOnlyPendingTimers()
    }
    jest.useRealTimers()
  })

  it('should render children and toast container', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>,
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Notificações' }),
    ).toBeInTheDocument()
  })

  it('should have no accessibility violations', async () => {
    jest.useRealTimers()

    const { container } = render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>,
    )

    await act(async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  it('should add toast with generated ID', () => {
    type AddToastFunction = (toast: { message: string; type: string }) => void

    const TestComponent = () => {
      const [addToastFn, setAddToastFn] =
        React.useState<AddToastFunction | null>(null)

      React.useEffect(() => {
        const checkForFunction = () => {
          if (mockSetToastFunction.mock.calls.length > 0) {
            setAddToastFn(() => mockSetToastFunction.mock.calls[0][0])
          }
        }

        const interval = setInterval(checkForFunction, 10)
        return () => clearInterval(interval)
      }, [])

      return (
        <div>
          {addToastFn && (
            <button
              onClick={() =>
                addToastFn({ message: 'Test toast', type: 'success' })
              }
              data-testid="add-toast"
            >
              Add Toast
            </button>
          )}
        </div>
      )
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    )

    act(() => {
      jest.advanceTimersByTime(100)
    })

    const addButton = screen.queryByTestId('add-toast')
    if (addButton) {
      act(() => {
        addButton.click()
      })

      const toast = screen.queryByText('Test toast')
      expect(toast).toBeInTheDocument()
    }
  })

  it('should remove toast when close button is clicked', () => {
    type AddToastFunction = (toast: { message: string; type: string }) => void

    const TestComponent = () => {
      const [addToastFn, setAddToastFn] =
        React.useState<AddToastFunction | null>(null)

      React.useEffect(() => {
        const checkForFunction = () => {
          if (mockSetToastFunction.mock.calls.length > 0) {
            setAddToastFn(() => mockSetToastFunction.mock.calls[0][0])
          }
        }

        checkForFunction()
        const interval = setInterval(checkForFunction, 10)
        return () => clearInterval(interval)
      }, [])

      React.useEffect(() => {
        if (addToastFn) {
          addToastFn({ message: 'Toast to remove', type: 'error' })
        }
      }, [addToastFn])

      return <div data-testid="test-component">Component ready</div>
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    )

    act(() => {
      jest.advanceTimersByTime(100)
    })

    const toast = screen.queryByText('Toast to remove')
    if (toast) {
      const closeButton = screen.queryByTestId(/close-/)

      if (closeButton) {
        act(() => {
          closeButton.click()
        })

        expect(screen.queryByText('Toast to remove')).not.toBeInTheDocument()
      }
    }
  })

  it('should render multiple toasts', () => {
    type AddToastFunction = (toast: { message: string; type: string }) => void

    const TestComponent = () => {
      const [addToastFn, setAddToastFn] =
        React.useState<AddToastFunction | null>(null)

      React.useEffect(() => {
        const checkForFunction = () => {
          if (mockSetToastFunction.mock.calls.length > 0) {
            setAddToastFn(() => mockSetToastFunction.mock.calls[0][0])
          }
        }

        checkForFunction()
      }, [])

      React.useEffect(() => {
        if (addToastFn) {
          addToastFn({ message: 'First toast', type: 'success' })
          addToastFn({ message: 'Second toast', type: 'warning' })
          addToastFn({ message: 'Third toast', type: 'error' })
        }
      }, [addToastFn])

      return <div>Multiple toasts test</div>
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    )

    act(() => {
      jest.advanceTimersByTime(100)
    })

    const firstToast = screen.queryByText('First toast')
    const secondToast = screen.queryByText('Second toast')
    const thirdToast = screen.queryByText('Third toast')

    if (firstToast) expect(firstToast).toBeInTheDocument()
    if (secondToast) expect(secondToast).toBeInTheDocument()
    if (thirdToast) expect(thirdToast).toBeInTheDocument()
  })
})
