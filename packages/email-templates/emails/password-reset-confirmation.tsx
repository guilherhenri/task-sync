import { Text } from '@react-email/components'
import type { EmailTemplateDataMap } from '@task-sync/api-types'

import { Content } from '../components/content'
import { Footer } from '../components/footer'
import { Header } from '../components/header'
import { Main } from '../components/main'
import { Title } from '../components/title'
import { colors } from '../constants'

type PasswordResetConfirmationEmailProps =
  EmailTemplateDataMap['password-reset']

export const PasswordResetConfirmationEmail = ({
  name,
}: PasswordResetConfirmationEmailProps) => (
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
        Sua senha foi redefinida com sucesso! Agora você pode fazer login na
        nossa plataforma usando sua nova senha.
      </Text>
      <Text
        style={{
          color: colors.foreground,
          fontSize: '16px',
          lineHeight: '24px',
          marginBottom: '20px',
        }}
      >
        Se você não realizou essa alteração, por favor, entre em contato com
        nosso suporte imediatamente.
      </Text>
    </Content>

    <Footer />
  </Main>
)

PasswordResetConfirmationEmail.PreviewProps = {
  name: 'Guilherme Henrique',
} as PasswordResetConfirmationEmailProps

export default PasswordResetConfirmationEmail
