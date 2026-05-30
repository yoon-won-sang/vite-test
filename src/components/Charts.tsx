import React, { Suspense } from 'react'

const ReactECharts = React.lazy(() => import('echarts-for-react'))

const Charts: React.FC = () => {
  const barOption = {
    title: { text: 'Monthly Sales', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Sales', type: 'bar', data: [120, 200, 150, 80, 70, 110, 130], itemStyle: { color: '#85CBFF' } },
    ],
  }

  const lineOption = {
    title: { text: 'Visitors', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'Visitors', type: 'line', smooth: true, data: [820, 932, 901, 934, 1290, 1330, 1320], itemStyle: { color: '#FF85C0' } },
    ],
  }

  const pieOption = {
    title: { text: 'User Distribution', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: 'Users',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 335, name: 'Direct', itemStyle: { color: '#B3FFB3' } },
          { value: 310, name: 'Email', itemStyle: { color: '#E6B3FF' } },
          { value: 234, name: 'Affiliate', itemStyle: { color: '#FFB3D9' } },
          { value: 135, name: 'Video', itemStyle: { color: '#B3D9FF' } },
          { value: 1548, name: 'Search', itemStyle: { color: '#FFE7B3' } },
        ],
      },
    ],
  }

  return (
    <div className="card-section">
      <h2 style={{ marginTop: 0 }}>Charts (ECharts)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Suspense fallback={<div>Loading charts…</div>}>
          <div style={{ background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts option={barOption} style={{ height: 320 }} />
          </div>

          <div style={{ background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts option={lineOption} style={{ height: 320 }} />
          </div>

          <div style={{ gridColumn: '1 / -1', background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts option={pieOption} style={{ height: 380 }} />
          </div>
        </Suspense>
      </div>
    </div>
  )
}

export default Charts
