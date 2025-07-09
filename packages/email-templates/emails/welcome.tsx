import { Button, Text } from '@react-email/components'
import type { EmailTemplateDataMap } from '@task-sync/api-types'
import { env } from '@task-sync/env'

import { Content } from '../components/content'
import { Footer } from '../components/footer'
import { Header } from '../components/header'
import { Main } from '../components/main'
import { Title } from '../components/title'
import { colors } from '../constants'

type WelcomeEmailProps = EmailTemplateDataMap['welcome']

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Main>
    <Header />

    <Content>
      <Title text={`Bem-vindo(a) ao TaskSync, ${name}!`} />
      <Text
        style={{
          fontSize: '16px',
          color: colors.foreground,
          lineHeight: '24px',
          marginBottom: '20px',
        }}
      >
        Estamos entusiasmados por você se juntar à nossa plataforma de
        gerenciamento colaborativo de tarefas! Com o TaskSync, você pode criar e
        gerenciar projetos, atribuir tarefas de forma inteligente, acompanhar o
        progresso em tempo real e receber notificações para manter sua equipe
        sempre alinhada.
      </Text>
      <Text
        style={{
          fontSize: '16px',
          color: colors.foreground,
          lineHeight: '24px',
          marginBottom: '30px',
        }}
      >
        Comece agora e descubra como o TaskSync pode transformar a coordenação e
        a eficiência dos seus projetos!
      </Text>
      <Button
        href={env.APP_URL}
        style={{
          backgroundColor: colors.primary,
          color: colors.primaryForeground,
          padding: '12px 24px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'inline-block',
        }}
      >
        Explorar o TaskSync
      </Button>
    </Content>

    <Footer />
  </Main>
)

WelcomeEmail.PreviewProps = {
  name: 'Guilherme Henrique',
} as WelcomeEmailProps

export default WelcomeEmail
