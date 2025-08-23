import type { Meta, StoryObj } from '@storybook/react-vite'
import { fontSizes } from '@task-sync/design-tokens'
import { Text, textElements, type TextProps } from '@task-sync/ui-components'
import { expect, within } from 'storybook/test'

const meta = {
  title: 'Typography/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    as: {
      options: textElements,
      control: { type: 'inline-radio' },
    },
    size: {
      options: Object.entries(fontSizes).map(([key]) => key),
      control: { type: 'inline-radio' },
    },
    color: {
      options: [],
      control: { type: 'color' },
    },
  },
} satisfies Meta<TextProps>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Text',
    as: 'p',
    size: 'base',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const text = canvas.getByText('Text')

    await expect(text).toBeInTheDocument()
  },
}
