import { Button, Link, Text } from '@react-email/components'
import * as React from 'react'

import { Content } from '../components/content'
import { Footer } from '../components/footer'
import { Header } from '../components/header'
import { Main } from '../components/main'
import { Title } from '../components/title'
import { colors } from '../constants'

export interface PasswordRecoveryEmailProps {
  name: string
  resetLink: string
}

export const PasswordRecoveryEmail = ({
  name,
  resetLink,
}: PasswordRecoveryEmailProps) => (
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
        Recebemos uma solicitação para redefinir sua senha. Clique no botão
        abaixo para criar uma nova senha.
      </Text>
      <Button
        href={resetLink}
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
        Redefinir Senha
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
        href={resetLink}
        style={{
          color: colors.primary,
          fontSize: '14px',
          wordBreak: 'break-all',
        }}
      >
        {resetLink}
      </Link>
      <Text
        style={{
          color: colors.foreground,
          fontSize: '14px',
          marginTop: '20px',
        }}
      >
        Caso você não tenha sido você que solicitou a redefinição de senha, por
        favor, ignore este e-mail.
      </Text>
    </Content>

    <Footer />
  </Main>
)
PasswordRecoveryEmail.PreviewProps = {
  name: 'Guilherme Henrique',
  resetLink: 'https://tasksync.com/token=example-token',
} as PasswordRecoveryEmailProps

export default PasswordRecoveryEmail
