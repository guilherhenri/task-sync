import type { Meta, StoryObj } from '@storybook/react-vite'
import { colors, fonts, fontSizes, space } from '@task-sync/design-tokens'
import {
  Button,
  Toast,
  toast,
  type ToastData,
  ToastProvider,
} from '@task-sync/ui-components'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

const ToastToggle = (args: ToastData) => {
  const [showToast, setShowToast] = useState(true)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      {showToast && <Toast {...args} onRemove={() => setShowToast(false)} />}

      <Button onClick={() => setShowToast(!showToast)}>
        {showToast ? 'Hide' : 'Show'}
      </Button>
    </div>
  )
}

const meta = {
  title: 'Feedback/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['success', 'error', 'warning'],
    },
    duration: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
    },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <ToastToggle {...args} />,
  args: {
    id: '1',
    message: 'Operação realizada com sucesso!',
    type: 'success',
    duration: 4000,
    onRemove: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toast = canvas.getByText('Operação realizada com sucesso!')
    const button = canvas.getByRole('button', { name: /hide/i })

    await expect(toast).toBeInTheDocument()
    await userEvent.click(button)
    await expect(
      canvas.getByRole('button', { name: /show/i }),
    ).toBeInTheDocument()
  },
}

export const Success: Story = {
  render: (args) => <ToastToggle {...args} />,
  args: {
    id: '2',
    message: 'Dados salvos com sucesso!',
    type: 'success',
    onRemove: () => {},
  },
}

export const Error: Story = {
  render: (args) => <ToastToggle {...args} />,
  args: {
    id: '3',
    message: 'Erro ao processar solicitação',
    type: 'error',
    onRemove: () => {},
  },
}

export const Warning: Story = {
  render: (args) => <ToastToggle {...args} />,
  args: {
    id: '4',
    message: 'Atenção: Verificar dados antes de continuar',
    type: 'warning',
    onRemove: () => {},
  },
}

export const WithProvider: Omit<Story, 'args'> = {
  render: () => (
    <ToastProvider>
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: colors.foreground }}>Exemplo com ToastProvider</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <Button onClick={() => toast.success('Sucesso!')}>
            Toast Success
          </Button>
          <Button onClick={() => toast.error('Erro!')}>Toast Error</Button>
          <Button onClick={() => toast.warning('Atenção!')}>
            Toast Warning
          </Button>
        </div>
        <p
          style={{
            marginTop: space['3'],
            fontFamily: fonts.default,
            fontSize: fontSizes.base,
            color: colors.foreground,
          }}
        >
          Clique nos botões para ver os toasts em ação
        </p>
      </div>
    </ToastProvider>
  ),
  parameters: {
    layout: 'fullscreen',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const successBtn = canvas.getByText('Toast Success')

    await userEvent.click(successBtn)
    await expect(canvas.getByText('Sucesso!')).toBeInTheDocument()
  },
}

export const MultipleToasts: Omit<Story, 'args'> = {
  render: () => (
    <ToastProvider>
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: colors.foreground }}>Múltiplos Toasts</h3>
        <Button
          onClick={() => {
            toast.success('Primeiro toast')
            setTimeout(() => toast.warning('Segundo toast'), 500)
            setTimeout(() => toast.error('Terceiro toast'), 1000)
          }}
        >
          Mostrar 3 Toasts
        </Button>
      </div>
    </ToastProvider>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

export const CustomDuration: Omit<Story, 'args'> = {
  render: () => (
    <ToastProvider>
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: colors.foreground }}>Durações Customizadas</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <Button onClick={() => toast.success('Rápido (1s)', 1000)}>
            1 second
          </Button>
          <Button onClick={() => toast.success('Normal (4s)', 4000)}>
            4 seconds
          </Button>
          <Button onClick={() => toast.success('Longo (8s)', 8000)}>
            8 seconds
          </Button>
        </div>
      </div>
    </ToastProvider>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}
