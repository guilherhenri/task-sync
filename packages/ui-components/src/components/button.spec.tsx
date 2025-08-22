import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

import { Button } from './button'

expect.extend(toHaveNoViolations)

describe('Button Component', () => {
  it('should be able to render a button with default props', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })

    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('btn btn--primary')
    expect(button).not.toHaveClass('btn--full')
  })

  it('should be able to apply custom className correctly', () => {
    render(<Button className="custom-class">Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })

    expect(button).toHaveClass('btn btn--primary custom-class')
  })

  it('should be able to render with fullWidth state', () => {
    render(<Button fullWidth>Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })

    expect(button).toHaveClass('btn btn--primary btn--full')
  })

  it('should be able to set custom type when provided', () => {
    render(<Button type="submit">Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })

    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should be able to set aria-label correctly when provided', () => {
    render(<Button aria-label="Custom Button">Click me</Button>)

    const button = screen.getByLabelText('Custom Button')

    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('should be able to use children as aria-label when no aria-label is provided', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByLabelText('Click me')

    expect(button).toBeInTheDocument()
  })

  it('should be able to pass additional props to the button element', () => {
    render(<Button data-testid="custom-button">Click me</Button>)

    const button = screen.getByTestId('custom-button')

    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('should be able to have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be able to have no accessibility violations with custom aria-label', async () => {
    const { container } = render(
      <Button aria-label="Custom Button">Click me</Button>,
    )

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should handle non-string children without setting aria-label', () => {
    const IconComponent = () => <span data-testid="icon">🔥</span>

    render(
      <Button>
        <IconComponent />
      </Button>,
    )

    const button = screen.getByRole('button')

    expect(button).toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-label')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should handle complex children (multiple elements) without setting aria-label', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>,
    )

    const button = screen.getByRole('button')

    expect(button).toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-label')
    expect(button).toHaveTextContent('IconText')
  })

  it('should handle JSX element as children without setting aria-label', () => {
    render(
      <Button>
        <div>Complex content</div>
      </Button>,
    )

    const button = screen.getByRole('button')

    expect(button).toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-label')
    expect(button).toHaveTextContent('Complex content')
  })

  it('should handle number as children and not set aria-label', () => {
    render(<Button>{42}</Button>)

    const button = screen.getByRole('button')

    expect(button).toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-label')
    expect(button).toHaveTextContent('42')
  })

  it('should handle mixed content without setting aria-label', () => {
    render(
      <Button>
        Click here <strong>now</strong>!
      </Button>,
    )

    const button = screen.getByRole('button')

    expect(button).toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-label')
    expect(button).toHaveTextContent('Click here now!')
  })

  it('should prioritize explicit aria-label over string children', () => {
    render(<Button aria-label="Custom Label">String content</Button>)

    const button = screen.getByLabelText('Custom Label')

    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Custom Label')
    expect(button).toHaveTextContent('String content')
  })
})
