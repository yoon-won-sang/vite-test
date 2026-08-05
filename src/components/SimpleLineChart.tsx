import React, { Suspense, useRef, useState } from 'react'
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
  const chartRef = useRef(null)

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

  // 차트 시리즈 구성: Sales(항상) + 선택된 시리즈
  const buildSeries = () => {
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

    return series
  }

  const lineOption = {
    title: { text: 'Simple Line Chart', left: 'left' },
    tooltip: { trigger: 'axis' },
    legend: { data: buildSeries().map((s) => s.name) },
    xAxis: { type: 'category', data: X_AXIS_DATA },
    yAxis: { type: 'value' },
    series: buildSeries(),
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
        <div ref={chartRef} style={{ width: '100%', height: 400, position: 'relative' }}>
          {/* 차트는 항상 유지 (깜박임 방지) */}
          <ReactECharts option={lineOption} style={{ height: 400 }} />
          {/* 로딩 중일 때만 오버레이 표시 */}
          {loading && <div style={styles.loadingOverlay}>{selectedSeries} 데이터 로딩 중...</div>}
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
