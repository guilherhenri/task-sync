import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'

import { Toast } from './toast-component'

expect.extend(toHaveNoViolations)

describe('Toast Component', () => {
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    mockOnRemove.mockClear()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    if (jest.isMockFunction(setTimeout)) {
      jest.runOnlyPendingTimers()
    }

    jest.useRealTimers()
  })

  it('should be able to render a toast with default props', () => {
    render(
      <Toast id="test-toast" message="Test message" onRemove={mockOnRemove} />,
    )

    const toast = screen.getByRole('alert')
    const message = screen.getByText('Test message')

    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('toast toast--success')
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveAttribute('aria-atomic', 'true')
    expect(toast).toHaveAttribute(
      'aria-describedby',
      'toast-message-test-toast',
    )
    expect(message).toHaveAttribute('id', 'toast-message-test-toast')
  })

  it('should be able to render with success type and icon', () => {
    render(
      <Toast
        id="success-toast"
        message="Success message"
        type="success"
        onRemove={mockOnRemove}
      />,
    )

    const toast = screen.getByRole('alert')
    const icon = screen.getAllByRole('img', { hidden: true })[0]

    expect(toast).toHaveClass('toast--success')
    expect(icon).toBeInTheDocument()
  })

  it('should be able to render with warning type and icon', () => {
    render(
      <Toast
        id="warning-toast"
        message="Warning message"
        type="warning"
        onRemove={mockOnRemove}
      />,
    )

    const toast = screen.getByRole('alert')

    expect(toast).toHaveClass('toast--warning')
  })

  it('should be able to render with error type and icon', () => {
    render(
      <Toast
        id="error-toast"
        message="Error message"
        type="error"
        onRemove={mockOnRemove}
      />,
    )

    const toast = screen.getByRole('alert')

    expect(toast).toHaveClass('toast--error')
  })

  it('should be able to show toast after animation delay', async () => {
    render(
      <Toast
        id="visible-toast"
        message="Visible message"
        onRemove={mockOnRemove}
      />,
    )

    const toast = screen.getByRole('alert')

    expect(toast).not.toHaveClass('toast--visible')

    act(() => {
      jest.advanceTimersByTime(10)
    })

    await waitFor(() => {
      expect(toast).toHaveClass('toast--visible')
    })
  })

  it('should be able to auto remove after duration', async () => {
    render(
      <Toast
        id="auto-remove-toast"
        message="Auto remove message"
        duration={2000}
        onRemove={mockOnRemove}
      />,
    )

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('toast--removing')
    })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('auto-remove-toast')
    })
  })

  it('should be able to close toast when close button is clicked', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    })

    render(
      <Toast
        id="closable-toast"
        message="Closable message"
        onRemove={mockOnRemove}
      />,
    )

    const closeButton = screen.getByRole('button', {
      name: 'Fechar notificação',
    })

    await user.click(closeButton)

    await waitFor(() => {
      const toast = screen.getByRole('alert')
      expect(toast).toHaveClass('toast--removing')
    })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('closable-toast')
    })
  })

  it('should be able to render close button with correct accessibility attributes', () => {
    render(
      <Toast
        id="accessible-toast"
        message="Accessible message"
        onRemove={mockOnRemove}
      />,
    )

    const closeButton = screen.getByRole('button', {
      name: 'Fechar notificação',
    })

    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveAttribute('type', 'button')
    expect(closeButton).toHaveAttribute('aria-label', 'Fechar notificação')
  })

  it('should be able to have correct message id association', () => {
    render(
      <Toast
        id="message-toast"
        message="Message with ID"
        onRemove={mockOnRemove}
      />,
    )

    const toast = screen.getByRole('alert')
    const message = screen.getByText('Message with ID')

    expect(toast).toHaveAttribute(
      'aria-describedby',
      'toast-message-message-toast',
    )
    expect(message).toHaveAttribute('id', 'toast-message-message-toast')
  })

  it('should be able to have no accessibility violations with success type', async () => {
    jest.useRealTimers()

    const { container } = render(
      <Toast
        id="success-a11y-toast"
        message="Success accessibility test"
        type="success"
        onRemove={mockOnRemove}
      />,
    )

    await act(async () => {
      const results = await axe(container)

      expect(results).toHaveNoViolations()
    })
  })

  it('should be able to have no accessibility violations with warning type', async () => {
    jest.useRealTimers()

    const { container } = render(
      <Toast
        id="warning-a11y-toast"
        message="Warning accessibility test"
        type="warning"
        onRemove={mockOnRemove}
      />,
    )

    await act(async () => {
      const results = await axe(container)

      expect(results).toHaveNoViolations()
    })
  })

  it('should be able to have no accessibility violations with error type', async () => {
    jest.useRealTimers()

    const { container } = render(
      <Toast
        id="error-a11y-toast"
        message="Error accessibility test"
        type="error"
        onRemove={mockOnRemove}
      />,
    )

    await act(async () => {
      const results = await axe(container)

      expect(results).toHaveNoViolations()
    })
  })
})
