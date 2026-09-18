import { Meta, StoryObj } from '@storybook/react';
import SimpleScatterChart from '../components/SimpleScatterChart';

const meta: Meta<typeof SimpleScatterChart> = {
  title: 'Charts/SimpleScatterChart',
  component: SimpleScatterChart,
};

export default meta;
type Story = StoryObj<typeof SimpleScatterChart>;

export const Default: Story = {};
