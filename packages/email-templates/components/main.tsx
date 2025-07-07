import { Body, Container, Head, Html } from '@react-email/components'
import type { ReactNode } from 'react'

import { colors } from '../constants'

export function Main({ children }: { children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: colors.background,
          fontFamily: 'Inter',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  )
}
