import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

import { Label } from './label'

expect.extend(toHaveNoViolations)

describe('Label Component', () => {
  it('should be able to render a label with correct text and htmlFor', () => {
    render(<Label htmlFor="input-id">Test Label</Label>)

    const label = screen.getByText('Test Label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).toHaveClass('label')
  })

  it('should be able to apply custom className correctly', () => {
    render(
      <Label htmlFor="input-id" className="custom-class">
        Test Label
      </Label>,
    )

    const label = screen.getByText('Test Label')

    expect(label).toHaveClass('label custom-class')
  })

  it('should be able to set aria-label correctly when provided', () => {
    render(
      <Label htmlFor="input-id" aria-label="Custom Aria Label">
        Test Label
      </Label>,
    )

    const label = screen.getByLabelText('Custom Aria Label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Test Label')
  })

  it('should be able to use children as aria-label when no aria-label is provided', () => {
    render(<Label htmlFor="input-id">Test Label</Label>)

    const label = screen.getByLabelText('Test Label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Test Label')
  })

  it('should be able to pass additional props to the label element', () => {
    render(
      <Label htmlFor="input-id" data-testid="custom-label">
        Test Label
      </Label>,
    )

    const label = screen.getByTestId('custom-label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Test Label')
  })

  it('should be able to have no accessibility violations', async () => {
    const { container } = render(<Label htmlFor="input-id">Test Label</Label>)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be able to have no accessibility violations with custom aria-label', async () => {
    const { container } = render(
      <Label htmlFor="input-id" aria-label="Custom Aria Label">
        Test Label
      </Label>,
    )

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should handle JSX element as children without setting aria-label from children', () => {
    render(
      <Label htmlFor="input-id">
        <span>Complex Label</span>
      </Label>,
    )

    const label = screen.getByText('Complex Label').closest('label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).not.toHaveAttribute('aria-label')
  })

  it('should handle multiple JSX elements as children without setting aria-label from children', () => {
    render(
      <Label htmlFor="input-id">
        <span>Part 1</span>
        <span>Part 2</span>
      </Label>,
    )

    const label = screen.getByText('Part 1').closest('label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).not.toHaveAttribute('aria-label')
    expect(label).toHaveTextContent('Part 1Part 2')
  })

  it('should handle component as children without setting aria-label from children', () => {
    const IconComponent = () => <i data-testid="icon">🏷️</i>

    render(
      <Label htmlFor="input-id">
        <IconComponent />
      </Label>,
    )

    const icon = screen.getByTestId('icon')
    const label = icon.closest('label')

    expect(label).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).not.toHaveAttribute('aria-label')
  })

  it('should handle mixed content (string + JSX) without setting aria-label from children', () => {
    render(
      <Label htmlFor="input-id">
        Required field: <strong>Name</strong>
      </Label>,
    )

    const label = screen.getByText(/Required field:/)

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).not.toHaveAttribute('aria-label')
    expect(label).toHaveTextContent('Required field: Name')
  })

  it('should handle number as children without setting aria-label from children', () => {
    render(<Label htmlFor="input-id">{123}</Label>)

    const label = screen.getByText('123')

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).not.toHaveAttribute('aria-label')
  })

  it('should prioritize explicit aria-label over non-string children', () => {
    render(
      <Label htmlFor="input-id" aria-label="Custom Label">
        <span>Visual Content</span>
      </Label>,
    )

    const label = screen.getByLabelText('Custom Label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('aria-label', 'Custom Label')
    expect(label).toHaveTextContent('Visual Content')
  })

  it('should handle empty JSX element as children', () => {
    render(
      <Label htmlFor="input-id" data-testid="label">
        <div></div>
      </Label>,
    )

    const label = screen.getByTestId('label')

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).not.toHaveAttribute('aria-label')
  })

  it('should handle boolean/null children without setting aria-label', () => {
    const showHidden = false

    render(
      <Label htmlFor="input-id">
        {showHidden && <span>Hidden</span>}
        Visible text
      </Label>,
    )

    const label = screen.getByText('Visible text')

    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'input-id')
    expect(label).not.toHaveAttribute('aria-label')
  })
})
