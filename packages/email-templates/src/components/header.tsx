import { Img, Section } from '@react-email/components'

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
        src="https://img.mailinblue.com/9063229/images/content_library/original/68b9b922cf9af01d237155a4.png"
        alt="Logo da Empresa"
        style={{ maxWidth: '200px', height: 'auto' }}
      />
    </Section>
  )
}
