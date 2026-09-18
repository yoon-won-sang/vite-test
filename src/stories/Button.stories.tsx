import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Button } from '../components/Button'

const meta = {
  component: Button,
  tags: ['ai-generated', 'needs-work'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { label: 'Primary Button', variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /primary button/i })
    await expect(button).toBeVisible()
  },
}

export const Secondary: Story = {
  args: { label: 'Secondary Button', variant: 'secondary' },
}

export const CssCheck: Story = {
  args: { label: 'Submit', variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /submit/i })
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(24, 145, 255)')
  },
}
