import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
const ReactECharts = React.lazy(() => import('echarts-for-react'))

/* ==================== 타입 정의 ==================== */
interface SeriesInfo {
  name: string
  api: string
  // ⭐ 이 옵션이 true 이면 "데이터 없는 시리즈" 케이스를 재현한다.
  //    - API 는 호출하지 않고 빈 배열([])만 selectedData 로 전달한다.
  //    - 시리즈 자체는 차트에 등록되지만 그릴 데이터가 없으므로,
  //      레전드(legend)에서도 제외되어야 한다.
  empty?: boolean
}

/* ==================== 상수 ==================== */
const BASE_SERIES = 'Sales'
const X_AXIS_DATA = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SALES_DATA = [10, 20, 15, 25, 30, 20, 15]

const OPTIONAL_SERIES: SeriesInfo[] = [
  { name: 'Revenue', api: 'https://jsonplaceholder.typicode.com/posts?_limit=7' },
  { name: 'Profit', api: 'https://jsonplaceholder.typicode.com/comments?_limit=7' },
  { name: 'Expenses', api: 'https://jsonplaceholder.typicode.com/todos?_limit=7' },
  // ⭐ 데이터가 없는 시리즈의 예 (시리즈는 등록되지만 빈 데이터)
  { name: '데이터 없음', api: '', empty: true },
]

/* ==================== 유틸 함수 ==================== */
// API 응답 데이터를 차트 데이터로 변환
const transformToChartData = (
  name: string,
  data: Array<{ id: number; userId: number }>,
): number[] => {
  switch (name) {
    case 'Revenue':
      return data.map((item, i) => (item.id % 10) + i * 3)
    case 'Profit':
      return data.map((item, i) => ((item.userId * 3) % 12) + i * 2)
    default:
      return data.map((item, i) => (item.id % 7) + i * 4 + 5)
  }
}

/* ==================== 컴포넌트 ==================== */
interface SimpleLineChartProps {
  // 부모(ChartTabExample)의 내부 탭에서 "MyChart" 탭으로 이동시키기 위한 콜백
  // prop 이 전달되지 않으면(예: App.tsx 에서 단독 사용) 버튼을 표시하지 않는다.
  onOpenMyChart?: () => void
  // ⭐ 부모(ChartTabExample)의 내부 탭에 "MyChart 탭을 동적으로 하나 추가"시키기 위한 콜백
  onAddDynamicMyChart?: () => void
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  onOpenMyChart,
  onAddDynamicMyChart,
}) => {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [selectedData, setSelectedData] = useState<number[] | null>(null)
  const [loading, setLoading] = useState(false)
  // onChartReady 로 확보한 최종(영구) ECharts 인스턴스를 보관
  // (echarts-for-react 는 초기화 시 임시 인스턴스를 폐기 후 재생성하므로 onChartReady 를 사용해야 안전)
  const chartInstanceRef = useRef<any>(null)

  // 선택 상자에서 시리즈를 선택했을 때만 axios 호출
  const handleSelectSeries = async (name: string) => {
    if (!name) return
    const seriesInfo = OPTIONAL_SERIES.find((s) => s.name === name)
    if (!seriesInfo) return

    setSelectedSeries(name)
    setSelectedData(null)
    setLoading(true)

    try {
      // ⭐ empty 옵션 시리즈는 API 를 호출하지 않고 빈 배열([])만 전달한다.
      //   - 시리즈는 차트에 등록되지만 데이터가 없어 아무것도 그려지지 않는다.
      //   - 이 경우 레전드에서도 제외한다 (buildOption 참고)
      const chartData = seriesInfo.empty
        ? []
        : transformToChartData(name, (await axios.get(seriesInfo.api)).data)
      setSelectedData(chartData)
    } catch (error) {
      console.error(`[${name}] 데이터 로드 실패:`, error)
      setSelectedData(null)
    } finally {
      setLoading(false)
    }
  }

  // 차트 옵션 구성: Sales(항상) + 선택된 시리즈
  const buildOption = () => {
    const series = [
      {
        name: BASE_SERIES,
        type: 'line',
        data: SALES_DATA,
        smooth: true,
      },
    ]

    // 선택된 시리즈 등록 (데이터가 빈 배열([])이어도 시리즈 자체는 차트에 등록)
    if (selectedSeries && selectedData) {
      series.push({
        name: selectedSeries,
        type: 'line',
        data: selectedData, // ⭐ 데이터 없음 케이스이면 [] 가 된다
        smooth: true,
      })
    }

    // ⭐ 데이터가 없는(빈 배열) 시리즈의 이름은 legend 에서 제외한다.
    const legendData = series.filter((s) => s.data.length > 0).map((s) => s.name)

    return {
      title: { text: 'Simple Line Chart', left: 'left' },
      tooltip: { trigger: 'axis' },
      legend: { data: legendData },
      xAxis: { type: 'category', data: X_AXIS_DATA },
      yAxis: { type: 'value' },
      series,
    }
  }

  // 선택된 시리즈/데이터가 바뀔 때마다 차트 인스턴스에 setOption 적용
  const lineOption = useMemo(() => buildOption(), [selectedSeries, selectedData])

  useEffect(() => {
    const chart = chartInstanceRef.current
    if (chart) {
      // notMerge=true 로 이전 옵션을 대체 (잔상/중복 시리즈 방지)
      chart.setOption(lineOption, true)
    }
  }, [lineOption])

  // echarts-for-react 가 최종 인스턴스를 생성한 직후 호출됨 (이 시점부터 인스턴스가 안정적)
  const handleChartReady = (instance: any) => {
    chartInstanceRef.current = instance
    instance.setOption(lineOption, true)
  }

  return (
    <div className="card-section">
      <div style={styles.selectRow}>
        <select
          value={selectedSeries ?? ''}
          onChange={(e) => handleSelectSeries(e.target.value)}
          disabled={loading}
          style={styles.select}
        >
          <option value="" disabled>
            시리즈 선택...
          </option>
          {OPTIONAL_SERIES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {/* ⭐ onOpenMyChart prop 이 있을 때만 표시: 클릭 시 부모(ChartTabExample)의 MyChart 탭으로 이동 */}
        {onOpenMyChart && (
          <button onClick={onOpenMyChart} style={styles.navButton}>
            MyChart 탭으로 이동
          </button>
        )}

        {/* ⭐ onAddDynamicMyChart prop 이 있을 때만 표시: 클릭 시 새 MyChart 탭을 동적으로 하나 추가 */}
        {onAddDynamicMyChart && (
          <button onClick={onAddDynamicMyChart} style={styles.addButton}>
            MyChart 탭이동2 (동적 추가)
          </button>
        )}
      </div>

      {/* ⭐ 선택된 시리즈의 데이터가 비어 있으면 차트에 그려지지 않고 레전드에서도 제외됨 */}
      {selectedSeries && selectedData && selectedData.length === 0 && (
        <div style={styles.hint}>
          「{selectedSeries}」 시리즈는 데이터가 없어 차트에 표시되지 않았으며, 레전드에서도
          제외되었습니다.
        </div>
      )}

      <Suspense fallback={<div>Loading chart...</div>}>
        <div style={{ width: '100%', height: 400, position: 'relative' }}>
          {/* 차트는 항상 유지 (깜박임 방지) - option 은 onChartReady + setOption 으로 주입 */}
          <ReactECharts option={{}} onChartReady={handleChartReady} style={{ height: 400 }} />
          {/* 로딩 중일 때만 오버레이 표시 */}
          {/* {loading && <div style={styles.loadingOverlay}>{selectedSeries} 데이터 로딩 중...</div>} */}
        </div>
      </Suspense>
    </div>
  )
}

/* ==================== 스타일 ==================== */
const styles: Record<string, React.CSSProperties> = {
  selectRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  select: {
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: 14,
  },
  hint: {
    marginBottom: 8,
    fontSize: 13,
    color: '#fa8c16',
  },
  navButton: {
    padding: '6px 14px',
    borderRadius: 4,
    border: '1px solid #1677ff',
    backgroundColor: '#1677ff',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  },
  addButton: {
    padding: '6px 14px',
    borderRadius: 4,
    border: '1px solid #52c41a',
    backgroundColor: '#52c41a',
    color: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    color: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
}

export default SimpleLineChart
