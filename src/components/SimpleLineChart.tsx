import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
const ReactECharts = React.lazy(() => import('echarts-for-react'))

/* ==================== 타입 정의 ==================== */
interface SeriesInfo {
  name: string
  api: string
}

/* ==================== 상수 ==================== */
const BASE_SERIES = 'Sales'
const X_AXIS_DATA = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SALES_DATA = [10, 20, 15, 25, 30, 20, 15]

const OPTIONAL_SERIES: SeriesInfo[] = [
  { name: 'Revenue', api: 'https://jsonplaceholder.typicode.com/posts?_limit=7' },
  { name: 'Profit', api: 'https://jsonplaceholder.typicode.com/comments?_limit=7' },
  { name: 'Expenses', api: 'https://jsonplaceholder.typicode.com/todos?_limit=7' },
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
const SimpleLineChart: React.FC = () => {
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
      const response = await axios.get(seriesInfo.api)
      const chartData = transformToChartData(name, response.data)
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

    if (selectedSeries && selectedData) {
      series.push({
        name: selectedSeries,
        type: 'line',
        data: selectedData,
        smooth: true,
      })
    }

    return {
      title: { text: 'Simple Line Chart', left: 'left' },
      tooltip: { trigger: 'axis' },
      legend: { data: series.map((s) => s.name) },
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
      </div>

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
