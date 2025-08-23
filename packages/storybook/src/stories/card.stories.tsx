import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from '@task-sync/ui-components'
import { expect, within } from 'storybook/test'

const meta = {
  title: 'Surfaces/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: (
      <>
        <p>Card element</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByText('Card element')

    await expect(card).toBeInTheDocument()
  },
}
