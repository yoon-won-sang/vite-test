import React, { Suspense, useState } from 'react'
import { Slider, Card, Space, Typography } from 'antd'

const ReactECharts = React.lazy(() => import('echarts-for-react'))

const { Title, Text } = Typography

const TrigonometricChart: React.FC = () => {
  const [dataSize, setDataSize] = useState(100)

  // Generate sin and cos data points with multiple points per angle to create a band effect
  const generateData = (size: number) => {
    const sinData: Array<{ value: [number, number]; itemStyle: { color: string } }> = []
    const cosData: Array<{ value: [number, number]; itemStyle: { color: string } }> = []
    const pointsPerAngle = 8 // Number of points around each angle

    Array.from({ length: size }, (_, i) => {
      const angle = (i / (size - 1)) * (2 * Math.PI)
      const hue = (angle / (2 * Math.PI)) * 360 // Rainbow colors based on angle

      // Generate multiple points around each angle to create a band effect
      Array.from({ length: pointsPerAngle }, (_, j) => {
        const offset = (j / pointsPerAngle) * 0.15 - 0.075 // Random vertical offset
        const x = angle + (Math.random() - 0.5) * 0.1 // Small random x offset

        const sinY = Math.sin(angle) + offset
        const cosY = Math.cos(angle) + offset

        const color = `hsl(${hue}, 100%, 50%)` // Rainbow color

        sinData.push({
          value: [x, sinY],
          itemStyle: { color },
        })
        cosData.push({
          value: [x, cosY],
          itemStyle: { color },
        })
      })
    })

    return { sinData, cosData }
  }

  const { sinData, cosData } = generateData(dataSize)

  const option = {
    animation: false,
    title: {
      text: 'Trigonometric Functions - Sin & Cos',
      left: 'center',
      top: 'top',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.componentSubType === 'scatter') {
          const x = (params.value[0] / Math.PI).toFixed(2)
          const y = params.value[1].toFixed(4)
          const seriesName = params.seriesName
          return `${seriesName}<br/>x: ${x}π<br/>y: ${y}`
        }
        return params.name
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['sin(x)', 'cos(x)'],
    },
    xAxis: {
      type: 'value',
      name: 'Angle (radians)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: 2 * Math.PI,
      axisLabel: {
        formatter: (value: number) => {
          if (value === 0) return '0'
          if (value === Math.PI / 2) return 'π/2'
          if (value === Math.PI) return 'π'
          if (value === (3 * Math.PI) / 2) return '3π/2'
          if (value === 2 * Math.PI) return '2π'
          return (value / Math.PI).toFixed(1) + 'π'
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Value',
      nameLocation: 'middle',
      nameGap: 30,
      min: -1.2,
      max: 1.2,
    },
    series: [
      {
        name: 'sin(x)',
        type: 'scatter',
        symbolSize: 3,
        data: sinData,
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
        },
      },
      {
        name: 'cos(x)',
        type: 'scatter',
        symbolSize: 3,
        data: cosData,
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
        },
      },
    ],
    grid: {
      containLabel: true,
    },
  }

  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <div style={{ padding: '20px' }}>
        <Card style={{ marginBottom: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={4}>Data Size Control</Title>
              <Text>
                각도별 데이터 포인트 개수: <strong>{dataSize}</strong> (각 각도마다 8개의 점이
                생성되어 무지개색 띠를 형성합니다)
              </Text>
            </div>
            <div>
              <Slider
                min={10}
                max={2000}
                step={100}
                value={dataSize}
                onChange={setDataSize}
                marks={{
                  10: '10',
                  100: '100',
                  250: '250',
                  500: '500',
                  1000: '1000',
                  2000: '2000',
                }}
              />
            </div>
            <Text type="secondary">
              수많은 점들이 모여 무지개색 띠 형태로 sin(x)와 cos(x) 함수의 형태를 표현합니다. 각
              점은 독립적인 데이터이며, 색상은 각도에 따라 무지개색으로 변합니다.
            </Text>
          </Space>
        </Card>

        <Card style={{ minHeight: '600px' }}>
          <ReactECharts option={option} style={{ height: '600px' }} />
        </Card>
      </div>
    </Suspense>
  )
}

export default TrigonometricChart
