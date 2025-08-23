import { Section } from '@react-email/components'
import type { ReactNode } from 'react'

export function Content({ children }: { children: ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
      }}
    >
      {children}
    </Section>
  )
}
