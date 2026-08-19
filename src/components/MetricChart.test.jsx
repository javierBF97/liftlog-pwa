import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />, XAxis: () => <div />, YAxis: () => <div />, Tooltip: () => <div />,
}));

import MetricChart from './MetricChart';

describe('MetricChart', () => {
  it('renders a line chart for the given series', () => {
    const { getByTestId } = render(<MetricChart data={[{ date: '2026-06-01', value: 100 }]} />);
    expect(getByTestId('line-chart')).toBeInTheDocument();
  });
});
