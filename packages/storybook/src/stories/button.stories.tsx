import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, type ButtonProps } from '@task-sync/ui-components'
import { expect, userEvent, within } from 'storybook/test'

const meta = {
  title: 'Form/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['primary'],
      control: { type: 'inline-radio' },
    },
    fullWidth: {
      options: [true, false],
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<ButtonProps>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    fullWidth: false,
    children: 'Entrar',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /entrar/i })

    await userEvent.click(button)
    await expect(button).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: { ...Primary.args, disabled: true },
}

export const FullWidth: Story = {
  args: { ...Primary.args, fullWidth: true },
}
