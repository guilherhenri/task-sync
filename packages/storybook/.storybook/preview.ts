import '@task-sync/ui-components/dist/index.css'

import type { Preview } from '@storybook/react-vite'
import { themes } from 'storybook/theming'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    docs: {
      theme: themes.dark,
    },
  },
}

export default preview
