import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input, type InputProps } from '@task-sync/ui-components'
import { expect, userEvent, within } from 'storybook/test'

const meta = {
  title: 'Form/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<InputProps>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    hasError: false,
    hasIcon: false,
    disabled: false,
    isFilled: false,
    'aria-label': 'input',
  },
  argTypes: {
    'aria-label': {
      table: { disable: true },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('input')

    await userEvent.type(input, 'Test input')
    await expect(input).toHaveValue('Test input')
  },
}
