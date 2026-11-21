import type { EChartsOption } from 'echarts'
import React, { Suspense, useMemo } from 'react'

const ReactECharts = React.lazy(() => import('echarts-for-react'))

/**
 * 레전드 클릭 예제 (바 차트)
 * - 레전드를 두 줄로 구성한다.
 *   · 상단 줄 : 일반 레전드 (클릭 시 선택/해제 토글)
 *   · 하단 줄 : 최초 로딩 시 "선택 해제" 상태이며, 클릭 시 토글(선택 ↔ 해제) 동작
 * - ECharts 의 legend 배열을 2개 사용해 상/하단 줄을 분리한다.
 */
const LegendClickChart: React.FC = () => {

  const [months, salesData, revenueData, visitorData, costData] = useMemo(
    () => [
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      [120, 200, 150, 80, 70, 110, 130],
      [200, 280, 230, 150, 140, 200, 240],
      [30, 45, 25, 60, 80, 55, 75],
      [80, 120, 90, 60, 50, 80, 100],
    ],
    []
  )

  const option: EChartsOption = useMemo(
    () => ({
      title: {
        text: '레전드 클릭 예제 (바 차트)',
        left: 'center',
        top: 0,
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      // ⭐ 레전드를 두 줄로 분리 (상단/하단)
      legend: [
        {
          // 상단 줄 : 일반 선택/해제 토글
          top: 36,
          left: 'center',
          data: ['매출', '수익'],
          itemGap: 24,
          selected: {
            '매출': true,
            '수익': true,
            '방문자': false,
            '비용': false,
          },
        },
        {
          // 하단 줄 : 최초 선택 해제 상태
          bottom: 10,
          left: 'center',
          data: ['방문자', '비용'],
          itemGap: 24,
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        top: 100,
        bottom: 60,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        { name: '매출', type: 'bar', data: salesData, itemStyle: { color: '#1677ff' } },
        { name: '수익', type: 'bar', data: revenueData, itemStyle: { color: '#36cfc9' } },
        { name: '방문자', type: 'bar', data: visitorData, itemStyle: { color: '#52c41a' } },
        { name: '비용', type: 'bar', data: costData, itemStyle: { color: '#faad14' } },
      ],
    }),
    [months, salesData, revenueData, visitorData, costData],
  )

  // const handleChartReady = () => {}

  return (
    <div className="card-section">
      <p style={{ marginBottom: 16, color: '#666' }}>
        상단 줄 레전드는 클릭 시 <strong>선택/해제</strong>가 토글되고, 하단 줄 레전드는 최초 로딩 시
        <strong> 선택 해제</strong> 상태이며, 클릭 시 <strong>선택/해제</strong>를 토글합니다.
      </p>

      <Suspense fallback={<div>Loading chart...</div>}>
        <div style={{ width: '100%', height: 400, position: 'relative' }}>
          <ReactECharts
            option={option}
            notMerge={true}
            style={{ height: 400, width: '100%' }}
          />
        </div>
      </Suspense>
    </div>
  )
}

export default LegendClickChart

