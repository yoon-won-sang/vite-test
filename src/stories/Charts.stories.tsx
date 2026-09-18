import type { Meta, StoryObj } from '@storybook/react';
import Charts from '../components/Charts';

const meta: Meta<typeof Charts> = {
  title: 'Components/Charts',
  component: Charts,
};

export default meta;
type Story = StoryObj<typeof Charts>;

export const Default: Story = {};
