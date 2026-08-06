import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface MyChartProps {
  // 필요한 경우 부모로부터 받을 데이터 구조 정의
  data?: any
  // 탭 변경 등 "리사이즈가 필요한 시점"에 값이 증가하는 신호
  // 부모(ChartTabExample)가 Tabs의 onChange 에서 이 값을 올려 보냄
  resizeSignal?: number
}

export default function MyChart({ data, resizeSignal = 0 }: MyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  // 1. 차트 인스턴스 초기화 + 옵션 설정 (데이터 변경 시 재생성)
  useEffect(() => {
    if (!containerRef.current) return
    chartInstance.current = echarts.init(containerRef.current)

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

    // 언마운트 시 메모리 누수 방지 리셋
    return () => {
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [data])

  // 2. ⭐️ 탭 변경 시점(resizeSignal 변경)에 리사이즈
  //    - rAF: antd 탭 motion/레이아웃이 끝난 "최종 크기"가 확정된 후 resize
  //    - 가드: 0 크기(숨김 탭)일 때는 무시 → 축이 작아지는 문제 방지
  useEffect(() => {
    const chart = chartInstance.current
    if (!chart) return

    const raf = requestAnimationFrame(() => {
      const el = containerRef.current
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        chart.resize()
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [resizeSignal])

  // ⚠️ 중요: 부모 컨테이너(Tabs)가 높이를 제공해야 하므로, 명시적인 height를 지정해야 합니다.
  return <div ref={containerRef} style={{ width: '100%', height: '400px', minHeight: '300px' }} />
}

