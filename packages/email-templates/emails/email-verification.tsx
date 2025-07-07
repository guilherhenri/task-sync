import { Button, Link, Text } from '@react-email/components'
import * as React from 'react'

import { Content } from '../components/content'
import { Footer } from '../components/footer'
import { Header } from '../components/header'
import { Main } from '../components/main'
import { Title } from '../components/title'
import { colors } from '../constants'

export interface EmailVerificationEmailProps {
  name: string
  verificationLink: string
}

export const EmailVerificationEmail = ({
  name,
  verificationLink,
}: EmailVerificationEmailProps) => (
  <Main>
    <Header />

    <Content>
      <Title text={`Oi, ${name}!`} />
      <Text
        style={{
          color: colors.foreground,
          fontSize: '16px',
          lineHeight: '24px',
          marginBottom: '20px',
        }}
      >
        Obrigado por se cadastrar no TaskSync! Para começar a usar sua conta,
        precisamos verificar seu endereço de e-mail clicando no botão abaixo.
      </Text>
      <Button
        href={verificationLink}
        style={{
          backgroundColor: colors.primary,
          color: colors.primaryForeground,
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Verificar E-mail
      </Button>
      <Text
        style={{
          color: colors.foreground,
          fontSize: '14px',
          marginTop: '20px',
        }}
      >
        Ou copie e cole este link no seu navegador:
      </Text>
      <Link
        href={verificationLink}
        style={{
          color: colors.primary,
          fontSize: '14px',
          wordBreak: 'break-all',
        }}
      >
        {verificationLink}
      </Link>
    </Content>

    <Footer />
  </Main>
)

EmailVerificationEmail.PreviewProps = {
  name: 'Guilherme Henrique',
  verificationLink: 'https://tasksync.com/token=example-token',
} as EmailVerificationEmailProps

export default EmailVerificationEmail
