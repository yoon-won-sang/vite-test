import React, { Suspense, useState, useMemo } from 'react'
import { Slider, Card, Space, Typography, Row, Col, Statistic } from 'antd'

const ReactECharts = React.lazy(() => import('echarts-for-react'))

const { Title, Text } = Typography

const SimpleScatterChart: React.FC = () => {
  const [dataCount, setDataCount] = useState(10000) // 1000 단위, 최대 50000

  // Generate scatter data with time on X-axis and decimal coordinates on Y-axis
  const generateData = useMemo(() => {
    return Array.from({ length: dataCount }, (_, i) => {
      const hours = (i / dataCount) * 24 // 0 to 24 hours
      const minutes = Math.floor((hours % 1) * 60)
      const hour = Math.floor(hours)

      // Generate random decimal Y coordinate
      const y = Math.random() * 100

      return [hours, y]
    }) as [number, number][]
  }, [dataCount])

  const option = {
    animation: false,
    animationDuration: 0,
    animationEasing: 'none',
    title: {
      text: 'Simple Scatter Chart - Time vs Coordinate',
      left: 'center',
      top: 'top',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.componentSubType === 'scatter') {
          const hours = Math.floor(params.value[0])
          const minutes = Math.round((params.value[0] % 1) * 60)
          const y = params.value[1].toFixed(2)
          return `Time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}<br/>Coordinate: ${y}`
        }
        return params.name
      },
    },
    xAxis: {
      type: 'value',
      name: 'Time (Hours)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: 24,
      axisLabel: {
        formatter: (value: number) => {
          const hour = Math.floor(value)
          const minute = Math.round((value % 1) * 60)
          return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Coordinate (Decimal)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: 100,
    },
    series: [
      {
        name: 'Data Points',
        type: 'scatter',
        symbolSize: 3,
        data: generateData,
        animation: false,
        progressive: false,
        progressiveThreshold: 0,
        itemStyle: {
          color: 'rgba(24, 144, 255, 0.6)',
        },
        emphasis: {
          itemStyle: {
            color: 'rgba(255, 77, 79, 1)',
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
              <Title level={4}>Data Point Control</Title>
              <Text>
                데이터 포인트 개수: <strong>{dataCount.toLocaleString()}</strong> 개 (1000단위)
              </Text>
            </div>

            <div>
              <Slider
                min={1000}
                max={50000}
                step={1000}
                value={dataCount}
                onChange={setDataCount}
                marks={{
                  1000: '1K',
                  10000: '10K',
                  25000: '25K',
                  50000: '50K',
                }}
              />
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Total Points" value={dataCount.toLocaleString()} suffix="개" />
              </Col>
              <Col span={8}>
                <Statistic title="X-Axis Range" value="0~24" suffix="hours" />
              </Col>
              <Col span={8}>
                <Statistic title="Y-Axis Range" value="0~100" suffix="decimal" />
              </Col>
            </Row>

            <Text type="secondary">
              X축은 24시간 시간 형식으로 표시되며, Y축은 0~100 범위의 소수점 좌표입니다. 슬라이더를
              조정하여 최대 50,000개의 데이터 포인트를 시각화할 수 있습니다.
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

export default SimpleScatterChart
