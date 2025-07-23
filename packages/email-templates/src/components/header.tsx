import { Img, Section } from '@react-email/components'
import { env } from '@task-sync/env'

import { colors } from '../constants'

export function Header() {
  return (
    <Section
      style={{
        borderBottom: '1px solid',
        borderBottomColor: colors.primary,
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <Img
        src={env.LOGO_CDN_URL}
        alt="Logo da Empresa"
        style={{ maxWidth: '200px', height: 'auto' }}
      />
    </Section>
  )
}
