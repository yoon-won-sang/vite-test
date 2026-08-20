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
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 40,
        bottom: 15,
        // 이동손잡이(move handle) 넓이 커스텀
        moveHandleSize: 24,
        moveHandleStyle: {
          color: '#1677ff',
          opacity: 0.9,
        },
      },
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

  const visitorData = Array.from({ length: 100 }, (_, i) => {
    let value
    if (i < 50) {
      // 50개: 4.0 ~ 7.4 사이
      value = 4.0 + Math.random() * (7.4 - 4.0)
    } else {
      // 50개: 0.023451 ~ 0.02999 사이
      value = 0.023451 + Math.random() * (0.02999 - 0.023451)
    }

    // 시간 데이터 생성 (2026-08-19 부터 1분 간격)
    const time = new Date(2026, 7, 19, 0, 0, 0).getTime() + i * 60000
    return [time, value]
  })

  const values = visitorData.map(d => d[1])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1
  const padding = range * 0.10

  const lineOption = {
    title: { text: 'Visitors', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'time',
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: minVal - padding,
      max: maxVal + padding,
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 },
    ],
    series: [
      {
        name: 'Visitors',
        type: 'line',
        smooth: true,
        data: visitorData,
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

  const exponentialData19 = Array.from({ length: 20 }, (_, i) => {
    const time = new Date(2026, 7, 20, 0, 0, 0).getTime() + i * 15 * 60000
    return [time, Math.pow(1.9, i)]
  })

  const exponentialData18 = Array.from({ length: 20 }, (_, i) => {
    const time = new Date(2026, 7, 20, 0, 0, 0).getTime() + i * 15 * 60000
    return [time, Math.pow(1.8, i)]
  })

  const exponentialData16 = Array.from({ length: 20 }, (_, i) => {
    const time = new Date(2026, 7, 20, 0, 0, 0).getTime() + i * 15 * 60000
    return [time, Math.pow(1.6, i)]
  })

  const exponentialData15 = Array.from({ length: 20 }, (_, i) => {
    const time = new Date(2026, 7, 20, 0, 0, 0).getTime() + i * 15 * 60000
    return [time, Math.pow(1.5, i)]
  })

  const exponentialOption = {
    title: { text: 'Exponential Growth', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['Growth 1.9', 'Growth 1.8', 'Growth 1.6', 'Growth 1.5'], top: 30 },
    grid: {
      top: 60,
      bottom: 60,
      left: 60,
      right: 60,
    },
    xAxis: { type: 'time' },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Growth 1.9',
        type: 'line',
        data: exponentialData19,
        itemStyle: { color: '#FFB347' },
      },
      {
        name: 'Growth 1.8',
        type: 'line',
        data: exponentialData18,
        itemStyle: { color: '#eb2f96' },
      },
      {
        name: 'Growth 1.6',
        type: 'line',
        data: exponentialData16,
        itemStyle: { color: '#52c41a' },
      },
      {
        name: 'Growth 1.5',
        type: 'line',
        data: exponentialData15,
        itemStyle: { color: '#1677ff' },
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
  const onLineChartReady = (chart: any) => {
    // 1. 그리드 정보 가져오기
    const grid = chart.getModel().getComponent('grid', 0)
    const rect = grid.coordinateSystem.getRect()
    const chartHeight = rect.height

    // 2. 10% 픽셀 여백 계산
    const paddingPx = chartHeight * 0.1

    // 3. 현재 y축 범위의 상단/하단 픽셀 위치
    const topPixel = rect.y
    const bottomPixel = rect.y + rect.height

    // 4. 10%만큼 확장된 새로운 픽셀 위치 계산
    const newTopPixel = topPixel - paddingPx
    const newBottomPixel = bottomPixel + paddingPx

    // 5. 새로운 픽셀 위치를 다시 데이터 값으로 변환
    const newMax = chart.convertFromPixel({ yAxisIndex: 0 }, newTopPixel)
    const newMin = chart.convertFromPixel({ yAxisIndex: 0 }, newBottomPixel)

    // 6. 차트 옵션 업데이트 (무한 루프 방지)
    const currentOption = chart.getOption()
    const currentMin = currentOption.yAxis[0].min
    const currentMax = currentOption.yAxis[0].max

    // 값이 유의미하게 다를 때만 업데이트 (오차 범위 고려)
    if (Math.abs((currentMin as number) - newMin) > 0.0001 || Math.abs((currentMax as number) - newMax) > 0.0001) {
      chart.setOption({
        yAxis: {
          min: newMin,
          max: newMax,
        },
      })
      console.log(`픽셀 기반 10% 여백 적용: min=${newMin.toFixed(4)}, max=${newMax.toFixed(4)}`)
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
            {/* @ts-ignore */}
            <ReactECharts option={exponentialOption} style={{ height: 380 }} />
          </div>
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
            <ReactECharts
              option={lineOption}
              onChartReady={onLineChartReady}
              style={{ height: 320 }}
            />
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
