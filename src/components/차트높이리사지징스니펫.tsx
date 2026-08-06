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

  // SimpleLineChart.tsx 수정 예시
  interface Props {
    resizeSignal?: number // 탭 변경 시점 신호 추가
  }
  //좀더 확실하게 한다.
  // const SimpleLineChart: React.FC<Props> = ({ resizeSignal = 0 }) => {
  //   const chartInstanceRef = useRef<any>(null)
  //   // ... (기존 handleChartReady 등 유지)

  //   // ⭐ 탭 변경 시점에 리사이즈 (MyChart와 동일한 방식)
  //   useEffect(() => {
  //     const chart = chartInstanceRef.current
  //     if (!chart) return
  //     const raf = requestAnimationFrame(() => {
  //       // echarts-for-react는 컨테이너에 이미 붙어 있으므로 인스턴스의 resize만 호출
  //       const el = document.getElementById('...') // 또는 컨테이너 ref
  //       if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
  //         chart.resize()
  //       }
  //     })
  //     return () => cancelAnimationFrame(raf)
  //   }, [resizeSignal])

  //   return (
  //     <ReactECharts
  //       option={{}}
  //       onChartReady={handleChartReady}
  //       style={{ height: 400 }}
  //     />
  //   )
  // }

  // `echarts-for-react`는 __이미 자체 `size-sensor`로 자동 리사이&#xC988;__&#xB97C; 합니다. 그런데 그 자동 리사이즈가 __숨김(0크기)/motion 중간값을 읽어 작게 캐&#xC2DC;__&#xD558;는 게 바로 축 축소의 원인입니다. 그래서:

  // - 탭 변경 시점에 명시적으로 `resize()`를 호출해 __최종 크기로 한 번 더 재배&#xCE58;__&#xC2DC;키면 축 축소가 해결됩니다.
  // - 다만 `size-sensor`의 자동 리사이즈가 여전히 존재하므로, (행여) rAF 한 번으로 안 잡히면 다중 프레임 재시도 방법을 쓰시면 됩니다.

  // ---

  // __정리__: "init이 없다"는 건 echarts-for-react가 대신 해줬기 때문이고, `onChartReady`/`getEchartsInstance()`로 인스턴스를 얻어 똑같이 `resize()`를 호출하면 됩니다.

  // 혹시 실제로 리사이즈를 적용하실 차트가 __저장소의 `SimpleLineChart.tsx`인지, 아니면 다른 별도 차트 컴포넌트인지__ 알려주시면, 그 파일에 탭 변경 리사이즈를 바로 적용해서 수정해 드리겠습니다. 어떤 차트를 말씀하시는 건가요?

  // ⚠️ 중요: 부모 컨테이너(Tabs)가 높이를 제공해야 하므로, 명시적인 height를 지정해야 합니다.
  return <div ref={containerRef} style={{ width: '100%', height: '400px', minHeight: '300px' }} />
}
