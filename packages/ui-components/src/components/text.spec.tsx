import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

import { Text } from './text'

expect.extend(toHaveNoViolations)

jest.mock('@task-sync/design-tokens', () => ({
  fontSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  },
}))

describe('Text Component', () => {
  it('should render a paragraph by default with correct text and class', () => {
    render(<Text>Test Text</Text>)

    const text = screen.getByText('Test Text')

    expect(text).toBeInTheDocument()
    expect(text.tagName).toBe('P')
    expect(text).toHaveClass('text')
  })

  it('should render with different HTML elements when as prop is provided', () => {
    render(<Text as="h1">Heading Text</Text>)

    const heading = screen.getByText('Heading Text')

    expect(heading).toBeInTheDocument()
    expect(heading.tagName).toBe('H1')
    expect(heading).toHaveClass('text')
  })

  it('should apply custom className alongside default class', () => {
    render(<Text className="custom-class">Test Text</Text>)

    const text = screen.getByText('Test Text')

    expect(text).toHaveClass('text')
    expect(text).toHaveClass('custom-class')
  })

  it('should apply font size from size prop', () => {
    render(<Text size="lg">Large Text</Text>)

    const text = screen.getByText('Large Text')

    expect(text).toHaveStyle({ fontSize: '18px' })
  })

  it('should apply default base font size when no size is provided', () => {
    render(<Text>Default Size Text</Text>)

    const text = screen.getByText('Default Size Text')

    expect(text).toHaveStyle({ fontSize: '16px' })
  })

  it('should pass through additional HTML attributes', () => {
    render(
      <Text id="test-id" data-testid="custom-test">
        Attributed Text
      </Text>,
    )

    const text = screen.getByText('Attributed Text')

    expect(text).toHaveAttribute('id', 'test-id')
    expect(text).toHaveAttribute('data-testid', 'custom-test')
  })

  it('should set aria-label from text content when no aria-label is provided', () => {
    render(<Text>Accessible Text</Text>)

    const text = screen.getByText('Accessible Text')

    expect(text).toHaveAttribute('aria-label', 'Accessible Text')
  })

  it('should preserve custom aria-label when provided', () => {
    render(<Text aria-label="Custom Label">Display Text</Text>)

    const text = screen.getByText('Display Text')

    expect(text).toHaveAttribute('aria-label', 'Custom Label')
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<Text>Accessible Text Content</Text>)

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with heading elements', async () => {
    const { container } = render(
      <div>
        <Text as="h1">Main Heading</Text>
        <Text as="h2">Sub Heading</Text>
        <Text as="p">Body text content</Text>
      </div>,
    )

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
