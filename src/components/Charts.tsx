import React, { Suspense, useRef, useState } from 'react'

const ReactECharts = React.lazy(() => import('echarts-for-react'))

const Y_AXIS_PADDING_RATIO = 0.04

const calculatePadding = (minVal: number, maxVal: number, ratio: number) => {
  const range = maxVal - minVal || 1
  return range * ratio
}

const getPrecision = (values: number[]) => {
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1
  // 범위의 로그를 통해 대략적인 소수점 자리수 계산 (최소 2자리 보장)
  const order = Math.floor(Math.log10(range))
  return Math.max(2, Math.abs(order) + 2)
}

const applyDynamicPadding = (chart: any, ratio: number) => {
  const grid = chart.getModel().getComponent('grid', 0)
  const rect = grid.coordinateSystem.getRect()
  const chartHeight = rect.height
  const paddingPx = chartHeight * ratio
  const topPixel = rect.y
  const bottomPixel = rect.y + rect.height
  const newMax = chart.convertFromPixel({ yAxisIndex: 0 }, topPixel - paddingPx)
  const newMin = chart.convertFromPixel({ yAxisIndex: 0 }, bottomPixel + paddingPx)
  console.log('newMin', newMin);
  const currentOption = chart.getOption()
  const seriesData = currentOption.series[0].data.map((d: any) => (Array.isArray(d) ? d[1] : d))
  const precision = getPrecision(seriesData)

  const roundedMin = Number(newMin.toFixed(precision))
  console.log('roundedMin', roundedMin);
  const roundedMax = Number(newMax.toFixed(precision))

  if (Math.abs((currentOption.yAxis[0].min as number) - roundedMin) > Math.pow(10, -precision) ||
      Math.abs((currentOption.yAxis[0].max as number) - roundedMax) > Math.pow(10, -precision)) {
    chart.setOption({
      yAxis: {
        min: roundedMin,
        max: roundedMax,
      },
    })
    console.log(`픽셀 기반 ${ratio * 100}% 여백 적용 (정밀도 ${precision}): min=${roundedMin}, max=${roundedMax}`)
  }
}

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
      value = 400.0 + Math.random() * (700.5 - 400.0)
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
  const padding = calculatePadding(minVal, maxVal, Y_AXIS_PADDING_RATIO)

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
      axisLabel: {
        showMinLabel: false,
        showMaxLabel: false,
      },
      splitLine: {
        lineStyle: {
          color: (value: number) => {
            // 비교 허용 오차를 좀 더 크게 잡아봅니다.
            const min = minVal - padding;
            const max = maxVal + padding;
            return (Math.abs(value - min) < 0.1 || Math.abs(value - max) < 0.1)
              ? 'transparent'
              : '#ccc';
          },
        },
      },
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
    animation: false,
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

  // 8월 한 달간의 데이터를 초 단위로 생성
  const startDate = new Date(2026, 7, 1, 0, 0, 0).getTime()
  const endDate = new Date(2026, 8, 1, 0, 0, 0).getTime()
  const totalSeconds = (endDate - startDate) / 1000
  const step = Math.floor(totalSeconds / 2000)

  const largeData1 = Array.from({ length: 2000 }, (_, i) => [startDate + i * step * 1000, Math.sin(i / 100) * 100 + Math.random() * 20])
  const largeData2 = Array.from({ length: 2000 }, (_, i) => [startDate + i * step * 1000, Math.cos(i / 100) * 100 + Math.random() * 20])
  const largeData3 = [...largeData2]
  const largeData4 = [...largeData1]
  const largeData5 = [...largeData2]

  const largeDataOption = {
    title: { text: 'August Data (Seconds)', left: 'center' },
    legend: { show: true, top: 30 },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        const data = params[0].data;
        const date = new Date(data[0]);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}<br/>
                ${params.map((p: any) => `${p.marker} ${p.seriesName}: ${p.value[1].toFixed(2)}`).join('<br/>')}`;
      }
    },
    toolbox: {
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
      },
    },
    xAxis: {
      type: 'time', // 시간 축 (연속형 데이터)
      axisLabel: {
        formatter: (value: number) => { // 축 레이블 포맷 설정
          const date = new Date(value);
          const hour = date.getHours();
          const minute = date.getMinutes();
          const second = date.getSeconds();

          // 0시 0분 0초에는 날짜 표시
          if (hour === 0 && minute === 0 && second === 0) {
            return `${date.getMonth() + 1}/${date.getDate()}`;
          } else if (second === 0) {
            // 0초일 때는 시:분 표시
            return `${hour}:${minute < 10 ? '0' + minute : minute}`;
          } else {
            // 그 외에는 시:분:초 표시
            return `${hour}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
          }
        }
      },
      minInterval: 3600 * 24 * 1000, // 최소 축 간격을 1일로 설정
    },
    yAxis: { type: 'value' }, // Y축 값 축
    dataZoom: [{ type: 'inside' }, { type: 'slider' }], // 데이터 줌 (내부 드래그, 슬라이더)
    series: [
      {
        name: 'Set 1 (Blue)',
        type: 'scatter', // 산점도 차트
        data: largeData1,
        large: true, // 대량 데이터 처리 최적화
        largeThreshold: 2000, // 최적화 임계값
        symbolSize: 2, // 데이터 포인트 크기
        progressive: 0, // 점진적 렌더링 끄기
        progressiveThreshold: 0,
        animation: false, // 애니메이션 비활성화 (성능 향상)
        hoverAnimation: false, // 호버 효과 비활성화 (성능 향상)
        itemStyle: { opacity: 0.6 } // 투명도 설정
      },
      {
        name: 'Set 2 (Red)',
        type: 'scatter',
        data: largeData2,
        large: true,
        largeThreshold: 2000,
        symbolSize: 2,
        progressive: 0,
        progressiveThreshold: 0,
        animation: false,
        hoverAnimation: false,
        itemStyle: { color: 'red', opacity: 0.6 }
      },
      {
        name: 'Set 3 (Orange)',
        type: 'scatter',
        data: largeData3,
        large: true,
        largeThreshold: 2000,
        symbolSize: 2,
        progressive: 0,
        progressiveThreshold: 0,
        animation: false,
        hoverAnimation: false,
        itemStyle: { color: 'orange', opacity: 0.6 }
      },
      {
        name: 'Set 4 (Purple)',
        type: 'scatter',
        data: largeData4,
        large: true,
        largeThreshold: 2000,
        symbolSize: 2,
        progressive: 0,
        progressiveThreshold: 0,
        animation: false,
        hoverAnimation: false,
        itemStyle: { color: 'purple', opacity: 0.6 }
      },
      {
        name: 'Set 5 (Black)',
        type: 'scatter',
        data: largeData5,
        large: true,
        largeThreshold: 2000,
        symbolSize: 2,
        progressive: 0,
        progressiveThreshold: 0,
        animation: false,
        hoverAnimation: false,
        itemStyle: { color: 'black', opacity: 0.6 }
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
    animation: false,
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
  const threeHourOption = {
    title: { text: '3-Hour Intervals', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'time',
      splitLine: { show: false },
      min: new Date(2026, 7, 20, 0, 0, 0).getTime(),
      max: new Date(2026, 7, 20, 21, 0, 0).getTime(),
      axisLabel: {
        interval: 0,
        formatter: (value: number) => {
          const date = new Date(value)
          const h = date.getHours()
          const m = date.getMinutes()
          if (h % 3 !== 0 || m !== 0) return ''
          const hh = String(h).padStart(2,'0')
          const mm = String(m).padStart(2,'0')
          const ss = String(date.getSeconds()).padStart(2,'0')
          return `${hh}:${mm}:${ss}`
        },
      },
    },
    series: [
      {
        name: '3-Hour Data',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 85 }, (_, i) => {
          const time = new Date(2026, 7, 20, 0, 0, 0).getTime() + i * 15 * 60000
          const value = 1 + (i / 84) * 20
          return [time, value]
        }),
        itemStyle: { color: '#722ed1' },
      },
    ],
  }

  const chartRef = useRef(null)
  const barChartRef = useRef(null)
  const [zoomActive, setZoomActive] = useState(false)
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
    applyDynamicPadding(chart, Y_AXIS_PADDING_RATIO)
  }
// 레전드 토글 시 잔상 방지를 위한 핸들러 (clear + setOption)
const onLegendSelectChanged = (chart: any) => {
  chart.on('legendselectchanged', (params: any) => {
    console.log('📊 legend select changed:', params)
    const option = chart.getOption()
    const series = option.series
    chart.clear()
    chart.setOption(
      { ...option, series },
      { notMerge: true, lazyUpdate: false }
    )
  })
}
// 'August Data (Seconds)' 데이터 Zoom 이벤트 핸들러
const largeDataEvents = {
  datazoom: (params: any) => {
    console.log('📊 seconds (largeData) dataZoom 이벤트:', params)
  },
}


// 'line chart' 데이터 Zoom 이벤트 핸들러
const lineEvents = {
  datazoom: (params: any) => {
    console.log('📊 line chart dataZoom 이벤트:', params)
  },
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
            <ReactECharts option={exponentialOption} style={{ height: 380 }} onChartReady={onLegendSelectChanged} />
          </div>
          <div style={{ gridColumn: '1 / -1', background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts option={largeDataOption} style={{ height: 380 }} onEvents={largeDataEvents} onChartReady={onLegendSelectChanged} />
          </div>
          <div style={{ background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts
              ref={barChartRef}
              option={barOption}
              onEvents={barEvents}
              onChartReady={onLineChartReady}
              style={{ height: 320 }}
            />
          </div>
          <div style={{ background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts
              option={lineOption}
              onEvents={lineEvents}
              onChartReady={onLineChartReady}
              style={{ height: 320 }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts option={pieOption} style={{ height: 380 }} onChartReady={onLegendSelectChanged} />
          </div>
          <div style={{ gridColumn: '1 / -1', background: 'white', padding: 12, borderRadius: 8 }}>
            {/* @ts-ignore */}
            <ReactECharts option={threeHourOption} style={{ height: 380 }} />
          </div>
        </Suspense>
      </div>
    </div>
  )
}

export default Charts
