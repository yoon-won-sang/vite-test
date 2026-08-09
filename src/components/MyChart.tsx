import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import * as echarts from 'echarts'
import { useTabStore } from '../stores/tabStore'

// ⭐ 부모(ChartTabExample)가 Map 으로 등록해서 refetch() 를 직접 호출할 수 있게 노출하는 핸들
export interface MyChartHandle {
  refetch: () => void
}

interface MyChartProps {
  // 필요한 경우 부모로부터 받을 데이터 구조 정의
  data?: any
  // 탭 변경 등 "리사이즈가 필요한 시점"에 값이 증가하는 신호
  // 부모(ChartTabExample)가 Tabs의 onChange 에서 이 값을 올려 보냄
  resizeSignal?: number
  // ⭐ 탭을 구분하는 식별자
  //   - queryKey 의 일부로 쓰여 각 탭이 서로 다른 캐시(독립적 작동)를 갖게 한다.
  //   - 동시에 데이터 변형의 시드(seed)로 쓰여 탭마다 다른 데이터를 만들어낸다.
  id?: string
}

const MyChart = forwardRef<MyChartHandle, MyChartProps>(function MyChart(
  { data, id = 'default' },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  // ---------------------------------------------------------------
  // ⭐ useQuery: 차트에 표시할 데이터를 서버에서 가져온다.
  //    - queryKey 에 id 가 포함되어 탭마다 캐시가 분리된다.
  //    - 탭이 언마운트되어도 캐시는 queryClient 에 남으므로, 다시 열면 id 별 데이터가 유지된다.
  //    - refetch() 를 호출하면 해당 탭의 데이터만 다시 받아온다.
  // ---------------------------------------------------------------
  const { data: queryData, refetch } = useQuery<number[]>({
    queryKey: ['chart', id],
    queryFn: async () => {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users')
      const users = response.data as Array<{ id: number; name: string }>
      // id 문자열을 해시(31 계수, 97 법)하여 1~96 사이의 고유한 시드 생성
      // (단순 charCode 합은 100의 배수가 되어 %100 결과가 전부 0이 되는 문제가 있었음)
      let h = 0
      for (let i = 0; i < id.length; i++) {
        h = (h * 31 + id.charCodeAt(i)) % 97
      }
      const seed = (h % 96) + 1 // 1 ~ 96
      // + i*7 오프셋을 더해 어떤 경우에도 0이 되지 않도록 한다.
      return users.map((user, i) => (user.id * seed + i * 7 + seed) % 100)
    },
    staleTime: 1000 * 60 * 5, // 5분 동안은 재호출하지 않음
  })

  // ⭐ 외부 호환용으로 refetch 를 핸들로 노출 (이제 refetch 는 store 를 통해 스스로 발동하므로,
  //    부모가 Map 으로 호출할 필요는 없어졌지만, 필요 시 직접 호출할 수 있도록 유지)
  useImperativeHandle(ref, () => ({ refetch }), [refetch])

  // 쿼리 데이터가 있으면 우선 사용하고, 없으면(또는 에러 시) 부모의 data prop 으로 폴백
  const chartData = queryData ?? data

  // ⭐ zustand: 이 탭이 "활성 탭"인지, "refetch 대상"으로 지목됐는지 구독
  const activeUuid = useTabStore((s) => s.activeUuid)
  const pendingRefetchUuid = useTabStore((s) => s.pendingRefetchUuid)
  const consumePendingRefetch = useTabStore((s) => s.consumePendingRefetch)
  const isActive = activeUuid === id

  // 1. 차트 인스턴스는 마운트 시 "1회"만 초기화한다.
  //    (데이터가 바뀔 때마다 init/dispose 를 반복하면,
  //     refetch 로 데이터 갱신 시 0크기/레이아웃 중 재초기화되어 차트가 안 그려질 수 있음)
  useEffect(() => {
    if (!containerRef.current) return
    const chart = echarts.init(containerRef.current)
    chartInstance.current = chart

    // 언마운트 시 메모리 누수 방지 리셋
    return () => {
      chart.dispose()
      chartInstance.current = null
    }
  }, [])

  // 2. 데이터(chartData)가 바뀔 때마다 "기존 인스턴스에 옵션만 갱신"한다.
  //    - notMerge=true 로 이전 옵션을 대체 (잔상/중복 시리즈 방지)
  useEffect(() => {
    const chart = chartInstance.current
    if (!chart) return

    chart.setOption(
      {
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
            data: chartData ?? [],
            type: 'line',
          },
        ],
      },
      true,
    )
  }, [chartData])

  // 3. ⭐️ "활성화 시점"에 리사이즈 (숨겨진 탭의 0크기 문제 방지)
  //    - rAF: antd 탭 motion/레이아웃이 끝난 "최종 크기"가 확정된 후 resize
  //    - 가드: 0 크기(숨김 탭)일 때는 무시 → 축이 작아지는 문제 방지
  //    - 최초 init 시 컨테이너가 0크기였더라도, 탭이 활성화되어 사이즈가 확정되면 여기서 잡는다.
  useEffect(() => {
    if (!isActive) return
    const chart = chartInstance.current
    if (!chart) return

    const raf = requestAnimationFrame(() => {
      const el = containerRef.current
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        chart.resize()
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [isActive, chartData])

  // 4. ⭐️ refetch 의도 처리 (탭 A 버튼으로 이동할 때만)
  //    - "내가 refetch 대상(uuid 일치) + 지금 활성 탭" 일 때만 refetch
  //    - 탭 클릭으로 활성화되면 pendingRefetchUuid 가 null 이라 실행되지 않는다
  //    - refetch 후 consumePendingRefetch 로 일회성 신호를 소비 → 다음엔 재실행 안 됨
  useEffect(() => {
    if (pendingRefetchUuid === id && isActive) {
      refetch()
      consumePendingRefetch(id)
    }
  }, [pendingRefetchUuid, isActive, id, refetch, consumePendingRefetch])

  // SimpleLineChart.tsx 수정 예시
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
})

export default MyChart
