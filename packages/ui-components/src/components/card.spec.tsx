import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

import { Card } from './card'

expect.extend(toHaveNoViolations)

describe('Card Component', () => {
  it('should be able to render a card with default props', () => {
    render(<Card />)

    const card = screen.getByRole('region')

    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('card')
    expect(card).toHaveAttribute('aria-label', 'Card content')
  })

  it('should be able to apply custom className correctly', () => {
    render(<Card className="custom-class" />)

    const card = screen.getByRole('region')

    expect(card).toHaveClass('card custom-class')
  })

  it('should be able to set custom role when provided', () => {
    render(<Card role="article" />)

    const card = screen.getByRole('article')

    expect(card).toBeInTheDocument()
  })

  it('should be able to set aria-label correctly when provided', () => {
    render(<Card aria-label="Custom Card" />)

    const card = screen.getByLabelText('Custom Card')

    expect(card).toBeInTheDocument()
  })

  it('should be able to set aria-labelledby when provided', () => {
    render(<Card aria-labelledby="label-id" />)

    const card = screen.getByRole('region')

    expect(card).toHaveAttribute('aria-labelledby', 'label-id')
    expect(card).not.toHaveAttribute('aria-label')
  })

  it('should be able to pass additional props to the card element', () => {
    render(<Card data-testid="custom-card" />)

    const card = screen.getByTestId('custom-card')

    expect(card).toBeInTheDocument()
  })

  it('should be able to have no accessibility violations', async () => {
    const { container } = render(<Card />)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be able to have no accessibility violations with custom aria-label', async () => {
    const { container } = render(<Card aria-label="Custom Card" />)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should be able to have no accessibility violations with aria-labelledby', async () => {
    const { container } = render(<Card aria-labelledby="label-id" />)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
