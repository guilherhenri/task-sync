import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

import { Input } from './input'

expect.extend(toHaveNoViolations)

describe('Input Component', () => {
  it('should be able to render an input with default props', () => {
    render(<Input id="test-input" />)

    const input = screen.getByRole('textbox')

    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveClass('input')
    expect(input).not.toHaveClass('input--error')
    expect(input).not.toHaveClass('input--icon')
    expect(input).not.toHaveClass('input--filled')
  })

  it('should be able to apply custom className correctly', () => {
    render(<Input id="test-input" className="custom-class" />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('input custom-class')
  })

  it('should be able to render with error state', () => {
    render(<Input id="test-input" hasError />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('input input--error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'error-message')
  })

  it('should be able to render with icon state', () => {
    render(<Input id="test-input" hasIcon />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('input input--icon')
  })

  it('should be able to render with filled state', () => {
    render(<Input id="test-input" isFilled />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('input input--filled')
  })

  it('should be able to set aria-label correctly when provided', () => {
    render(<Input id="test-input" aria-label="Custom Aria Label" />)

    const input = screen.getByLabelText('Custom Aria Label')

    expect(input).toBeInTheDocument()
  })

  it('should be able to set custom aria-describedby when provided', () => {
    render(<Input id="test-input" aria-describedby="custom-error" hasError />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveAttribute('aria-describedby', 'custom-error')
  })

  it('should be able to pass additional props to the input element', () => {
    render(<Input id="test-input" data-testid="custom-input" />)

    const input = screen.getByTestId('custom-input')

    expect(input).toBeInTheDocument()
  })

  it('should be able to render with custom type', () => {
    render(<Input id="test-input" type="email" />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveAttribute('type', 'email')
  })

  it('should be able to have no accessibility violations', async () => {
    const { container } = render(
      <Input id="test-input" aria-label="Test Input" />,
    )

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be able to have no accessibility violations with error state', async () => {
    const { container } = render(
      <Input
        id="test-input"
        hasError
        aria-label="Test Input"
        aria-describedby="error-message"
      />,
    )

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
