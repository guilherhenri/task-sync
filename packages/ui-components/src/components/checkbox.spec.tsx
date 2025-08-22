import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

import { Checkbox } from './checkbox'

expect.extend(toHaveNoViolations)

describe('Checkbox Component', () => {
  it('should be able to render a checkbox with default props', () => {
    render(<Checkbox id="test-checkbox" />)

    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveClass('checkbox')
    expect(checkbox).toHaveAttribute('aria-label', 'Checkbox')
  })

  it('should be able to apply custom className correctly', () => {
    render(<Checkbox id="test-checkbox" className="custom-class" />)

    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toHaveClass('checkbox custom-class')
  })

  it('should be able to set aria-label correctly when provided', () => {
    render(<Checkbox id="test-checkbox" aria-label="Custom Checkbox" />)

    const checkbox = screen.getByLabelText('Custom Checkbox')

    expect(checkbox).toBeInTheDocument()
  })

  it('should be able to set aria-describedby when provided', () => {
    render(<Checkbox id="test-checkbox" aria-describedby="description-id" />)

    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toHaveAttribute('aria-describedby', 'description-id')
  })

  it('should be able to pass additional props to the checkbox element', () => {
    render(<Checkbox id="test-checkbox" data-testid="custom-checkbox" />)

    const checkbox = screen.getByTestId('custom-checkbox')

    expect(checkbox).toBeInTheDocument()
  })

  it('should be able to render indicator when checked', () => {
    render(<Checkbox id="test-checkbox" checked />)

    const indicator = screen.getByRole('img', { hidden: true })

    expect(indicator).toHaveClass('checkbox__indicator__icon')
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
  })

  it('should be able to have no accessibility violations', async () => {
    const { container } = render(<Checkbox id="test-checkbox" />)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be able to have no accessibility violations with custom aria-label', async () => {
    const { container } = render(
      <Checkbox id="test-checkbox" aria-label="Custom Checkbox" />,
    )

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be able to have no accessibility violations when checked', async () => {
    const { container } = render(<Checkbox id="test-checkbox" checked />)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
