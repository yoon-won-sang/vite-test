import React, { Suspense, useRef, useState } from 'react'

const ReactECharts = React.lazy(() => import('echarts-for-react'))

const Charts: React.FC = () => {
  const barOption = {
    title: { text: 'Monthly Sales', left: 'center' },
    tooltip: {},
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    yAxis: { type: 'value' },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100, height: 40, bottom: 15 },
    ],
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: [120, 200, 150, 80, 70, 110, 130],
        itemStyle: { color: '#85CBFF' },
      },
    ],
  }

  // bar 차트의 dataZoom 영역이 클릭/조작될 때 호출되는 이벤트 핸들러
  const barEvents = {
    datazoom: (params: any) => {
      console.log('📊 bar dataZoom 이벤트:', params)
    },
    // click: (params: any) => {
    //   console.log('📊 bar 클릭 이벤트:', params)
    // },
  }

  const lineOption = {
    title: { text: 'Visitors', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 },
    ],
    series: [
      {
        name: 'Visitors',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        itemStyle: { color: '#FF85C0' },
      },
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

  const scatterOption = {
    tooltip: { trigger: 'item' },
    xAxis: {},
    yAxis: {},
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
        },
        brush: {
          type: ['rect', 'keep', 'clear'],
        },
      },
    },
    dataZoom: [{ type: 'inside', start: 0, end: 100 }],
    series: [
      {
        symbolSize: 20,
        data: [
          [10.0, 8.04],
          [8.07, 6.95],
          [13.0, 7.58],
          [9.05, 8.81],
          [11.0, 8.33],
          [14.0, 7.66],
          [13.4, 6.81],
          [10.0, 6.33],
          [14.0, 8.96],
          [12.5, 6.82],
          [9.15, 7.2],
          [11.5, 7.2],
          [3.03, 4.23],
          [12.2, 7.83],
          [2.02, 4.47],
          [1.05, 3.33],
          [4.05, 4.96],
          [6.03, 7.24],
          [12.0, 6.26],
          [12.0, 8.84],
          [7.08, 5.82],
          [5.02, 5.68],
        ],
        type: 'scatter',
      },
    ],
  }

  const chartRef = useRef(null)
  const barChartRef = useRef(null)
  const [zoomActive, setZoomActive] = useState(false)

  // bar 차트의 zoom 패널(dataZoom slider) 클릭 감지
  // ECharts의 chart-level 'click' 이벤트는 slider 내부 요소에는 발생하지 않으므로
  // ZRender(getZr) 레벨에서 클릭 대상이 slider 그룹에 속하는지 판별한다.
  const onBarChartReady = (chart: any) => {
    if (chart.__barZoomClickAttached) return
    chart.__barZoomClickAttached = true

    const sliderModel = chart.getModel().getComponent('dataZoom', 1) // 0: inside, 1: slider
    const sliderView = sliderModel && chart.getViewOfComponentModel(sliderModel)
    const sliderGroup = sliderView && sliderView.group
    if (!sliderGroup) return

    chart.getZr().on('click', (e: any) => {
      let el = e && e.target
      while (el) {
        if (el === sliderGroup) {
          console.log('📊 bar zoom 패널 클릭:', e)
          return
        }
        el = el.parent
      }
    })
  }

  const toggleZoom = () => {
    if (chartRef.current) {
      // @ts-ignore
      const chart = chartRef.current.getEchartsInstance()
      if (zoomActive) {
        chart.dispatchAction({
          type: 'takeGlobalCursor',
          key: 'dataZoomSelect',
          dataZoomSelectActive: false,
        })
      } else {
        chart.dispatchAction({
          type: 'takeGlobalCursor',
          key: 'dataZoomSelect',
          dataZoomSelectActive: true,
        })
      }
      setZoomActive(!zoomActive)
    }
  }
  const resetZoom = () => {
    if (chartRef.current) {
      // @ts-ignore
      const chart = chartRef.current.getEchartsInstance()
      chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
    }
  }
  return (
    <div className="card-section">
      <h2 style={{ marginTop: 0 }}>Charts (ECharts)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Suspense fallback={<div>Loading charts…</div>}>
          <button
            onClick={toggleZoom}
            style={{
              marginBottom: '10px',
              background: zoomActive ? '#1677ff' : undefined,
              color: zoomActive ? '#fff' : undefined,
            }}
          >
            {zoomActive ? 'Zoom ON' : 'Zoom OFF'}
          </button>
          <button onClick={resetZoom} style={{ marginBottom: '10px' }}>
            Reset Zoom
          </button>
          <div style={{ gridColumn: '1 / -1', background: 'white', padding: 12, borderRadius: 8 }}>
            <ReactECharts ref={chartRef} option={scatterOption} style={{ height: 380 }} />
          </div>
          <div style={{ background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts
              ref={barChartRef}
              option={barOption}
              onEvents={barEvents}
              onChartReady={onBarChartReady}
              style={{ height: 320 }}
            />
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
