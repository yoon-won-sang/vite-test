import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface MyChartProps {
  // 필요한 경우 부모로부터 받을 데이터 구조 정의
  data?: any
}

export default function MyChart({ data }: MyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 1. ECharts 인스턴스 초기화
    chartInstance.current = echarts.init(containerRef.current)

    // 2. 차트 옵션 설정 (y축 및 데이터)
    const option: echarts.EChartsOption = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['월', '화', '수', '목', '금', '토', '일'],
      },
      yAxis: {
        type: 'value',
        // 축소 방지를 위해 안정적인 최소/최대값 설정을 원할 경우 추가 가능
        minInterval: 1,
      },
      series: [
        {
          data: data ?? [],
          type: 'line',
        },
      ],
    }

    chartInstance.current.setOption(option)

    // 3. ⭐️ 핵심: 부모 탭 전환으로 인한 크기 변화 감지 (y축 축소 완벽 방지)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Antd Tabs 전환 시 width와 height가 0보다 커지는 순간을 포착합니다.
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          chartInstance.current?.resize()
        }
      }
    })

    // 감지 시작
    resizeObserver.observe(containerRef.current)

    // 4. 컴포넌트 언마운트 시 메모리 누수 방지 리셋
    return () => {
      resizeObserver.disconnect()
      chartInstance.current?.dispose()
    }
  }, [data]) // 데이터가 변경될 때도 차트를 다시 그릴 수 있도록 의존성 배열 추가

  // ⚠️ 중요: 부모 컨테이너(Tabs)가 높이를 제공해야 하므로, 명시적인 height를 지정해야 합니다.
  return <div ref={containerRef} style={{ width: '100%', height: '400px', minHeight: '300px' }} />
}
