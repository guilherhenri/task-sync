import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from '@task-sync/ui-components'
import { expect, within } from 'storybook/test'

const meta = {
  title: 'Form/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Label',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText('Label')

    await expect(label).toBeInTheDocument()
  },
}
