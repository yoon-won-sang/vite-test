import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import MockDate from 'mockdate'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { mswHandlers } from './msw-handlers'

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
    msw: {
      handlers: mswHandlers,
    },
  },
  loaders: [mswLoader()],
  beforeEach: async () => {
    MockDate.set('2024-04-01T12:00:00Z')
  },
}

export default preview
