import { Heading } from '@react-email/components'

import { colors } from '../constants'

export function Title({ text }: { text: string }) {
  return (
    <Heading
      style={{
        color: colors.foreground,
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
      }}
    >
      {text}
    </Heading>
  )
}
