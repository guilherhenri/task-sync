import { Section, Text } from '@react-email/components'

import { colors } from '../constants'

export function Footer() {
  return (
    <Section
      style={{
        backgroundColor: colors.footer,
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <Text style={{ fontSize: '14px', color: colors.footerForeground }}>
        © 2025 TaskSync. Todos os direitos reservados.
      </Text>
      <Text style={{ fontSize: '14px', color: colors.footerForeground }}>
        Se precisar de ajuda, entre em contato pelo{' '}
        <a
          href="mailto:suporte@tasksync.com"
          style={{ color: colors.primary, textDecoration: 'none' }}
        >
          suporte@tasksync.com
        </a>
        .
      </Text>
    </Section>
  )
}
