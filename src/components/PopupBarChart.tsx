import type { EChartsOption } from 'echarts'
import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { Modal, Typography } from 'antd'

const ReactECharts = React.lazy(() => import('echarts-for-react'))

const { Title, Paragraph } = Typography

/* ==================== 상수 ==================== */
/**
 * Toolbox 팝업 버튼 아이콘.
 * Material Design "open_in_new" 아이콘의 SVG path 데이터.
 * ECharts toolbox 아이콘은 bounding box를 아이콘 크기(itemSize)에 맞춰 자동 스케일하므로
 * 어떤 좌표계의 path든 그대로 사용할 수 있다.
 */
const POPUP_ICON_PATH =
  'M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0 0 5,21H19A2,2 0 0 0 21,19V12H19V19Z'

const MONTHS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
]
const ELECTRONICS = [320, 402, 285, 460, 390, 420, 310, 270, 340, 390, 330, 480]
const HOME_APPLIANCES = [220, 182, 191, 234, 290, 330, 310, 300, 220, 250, 270, 320]

/**
 * 시리즈 정의를 데이터로 관리한다.
 * ⭐ '신규 상품군'처럼 임의의 시리즈가 데이터가 없어도(빈 배열) 아래 hasData()/LEGEND_DATA 가
 *    자동으로 걸러내어 레전드에 표시되지 않는다. 어떤 시리즈가 빈 데이터가 되어도 동일하게 작동한다.
 */
const SERIES_DEFS: { name: string; values: number[] }[] = [
  { name: '가전제품', values: ELECTRONICS },
  { name: '생활용품', values: HOME_APPLIANCES },
  { name: '신규 상품군', values: [] }, // ⭐ 데이터 없음: 막대 미표시 + 레전드 자동 제외
]

/** 시리즈별 막대 색상 (SERIES_DEFS 순서와 동일) */
const BAR_COLORS = ['#85cbff', '#b3ffb3', '#ffd666']
/** 모달 차트용 시리즈별 그래디언트 색상 (from, to) */
const BAR_GRADIENTS: [string, string][] = [
  ['#85cbff', '#1677ff'],
  ['#b3ffb3', '#52c41a'],
  ['#ffd666', '#fa8c16'],
]

/* ==================== 유틸 함수 ==================== */

/** 데이터가 하나라도 존재하는 시리즈인지 판별 (빈 배열이면 "데이터 없음") */
const hasData = (values: number[]): boolean => values.length > 0

/**
 * ⭐ 임의의 시리즈가 데이터가 없어도 자동 처리하는 레전드 목록.
 * SERIES_DEFS 중 데이터가 있는 시리즈만 골라 legend.data 로 사용한다.
 * (legend.data 를 지정하지 않으면 데이터가 없는 시리즈도 레전드에 자동 추가되므로,
 *  반드시 이렇게 명시적으로 지정해야 한다)
 */
const LEGEND_DATA: string[] = SERIES_DEFS.filter((s) => hasData(s.values)).map((s) => s.name)

/**
 * ⭐ 레전드 표시명을 시리즈 name 과 다르게 보여주고 싶을 때 사용하는 매핑.
 * (예: 시리즈 name 은 '가전제품' 이지만, 레전드에는 '전자제품' 으로 표시)
 * 시리즈 name 을 그대로 표시하려면 매핑에 없으면 된다.
 */
const LEGEND_DISPLAY_NAMES: Record<string, string> = {
  가전제품: '전자제품',
}

/**
 * legend.formatter: 레전드 항목의 실제 시리즈 name('가전제품')은 그대로 두고
 * 화면 표시 문자열만 LEGEND_DISPLAY_NAMES 로 치환한다.
 * (legend.data 는 시리즈 name 과 매칭되어야 토글 버튼이 정상 동작하므로
 *  반드시 name 기준으로 두고, 표시만 formatter 로 바꿔야 한다)
 */
const legendFormatter = (name: string): string => LEGEND_DISPLAY_NAMES[name] ?? name

/** 세로 방향(위 → 아래) 막대 그래디언트 */
const verticalGradient = (from: string, to: string) => ({
  type: 'linear' as const,
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: from },
    { offset: 1, color: to },
  ],
})

/**
 *
 * 메인(페이지) 차트 옵션.
 * - toolbox.feature.myPopup: 커스텀 툴박스 버튼.
 *   ECharts 는 feature 이름이 "my"로 시작하는 경우에만 커스텀 feature로 인식하고,
 *   해당 옵션의 onclick 을 그대로 호출한다. (ToolboxView.js isUserFeatureName)
 * - 아이콘은 POPUP_ICON_PATH(open_in_new)를 사용하고, 클릭 시 모달을 연다.
 */
const buildMainOption = (onPopup: () => void): EChartsOption => ({
  title: { text: '2025 연간 월별 매출', left: 'center', textStyle: { fontSize: 16 } },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: {
    // ⭐ SERIES_DEFS 로부터 자동 생성한 LEGEND_DATA 를 사용한다.
    // 어떤 시리즈라도 데이터가 없으면(빈 배열) 레전드에서 자동으로 제외된다.
    // formatter 로 표시명만 치환된다. (시리즈 name 은 '가전제품', 레전드 표기 '전자제품')
    data: LEGEND_DATA,
    formatter: legendFormatter,
    top: 30,
  },
  grid: { left: 50, right: 30, top: 70, bottom: 40 },
  toolbox: {
    right: 16,
    top: 10,
    itemSize: 18,
    iconStyle: { borderColor: '#1677ff', borderWidth: 1.2 },
    feature: {
      myPopup: {
        show: true,
        title: '모달 팝업으로 크게 보기',
        icon: POPUP_ICON_PATH,
        onclick: onPopup,
      },
    },
  },
  xAxis: { type: 'category', data: MONTHS },
  yAxis: { type: 'value', name: '매출(만원)' },
  // 시리즈는 SERIES_DEFS 로부터 일괄 생성한다 (빈 데이터 시리즈도 포함 → 렌더링되지만 막대 없음)
  series: SERIES_DEFS.map((s, i) => ({
    name: s.name,
    type: 'bar' as const,
    barMaxWidth: 28,
    data: s.values,
    itemStyle: { color: BAR_COLORS[i], borderRadius: [4, 4, 0, 0] },
  })),
})
/** 모달(팝업) 차트 옵션 - 더 크고 상세하게 표시 */
const buildModalOption = (): EChartsOption => ({
  title: {
    text: '모달 팝업 - 2025 연간 월별 매출 상세',
    left: 'center',
    textStyle: { fontSize: 17 },
  },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: {
    // ⭐ SERIES_DEFS 로부터 자동 생성한 LEGEND_DATA 를 사용한다.
    // 어떤 시리즈라도 데이터가 없으면(빈 배열) 레전드에서 자동으로 제외된다.
    // formatter 로 표시명만 치환된다. (시리즈 name 은 '가전제품', 레전드 표기 '전자제품')
    data: LEGEND_DATA,
    formatter: legendFormatter,
    top: 30,
  },
  toolbox: {
    right: 16,
    top: 10,
    itemSize: 18,
    feature: {
      saveAsImage: { show: true, title: '이미지로 저장' },
    },
  },
  grid: { left: 60, right: 40, top: 80, bottom: 60 },
  xAxis: { type: 'category', data: MONTHS, axisLabel: { interval: 0 } },
  yAxis: { type: 'value', name: '매출(만원)' },
  // 시리즈는 SERIES_DEFS 로부터 일괄 생성한다 (빈 데이터 시리즈도 포함 → 렌더링되지만 막대 없음)
  series: SERIES_DEFS.map((s, i) => ({
    name: s.name,
    type: 'bar' as const,
    barMaxWidth: 40,
    data: s.values,
    itemStyle: {
      color: verticalGradient(BAR_GRADIENTS[i][0], BAR_GRADIENTS[i][1]),
      borderRadius: [6, 6, 0, 0],
    },
    label: { show: true, position: 'top', formatter: '{c}' },
  })),
})

/* ==================== 컴포넌트 ==================== */
/**
 * 막대차트 팝업 예제
 * 1. 페이지에 막대차트를 렌더링한다.
 * 2. 차트 우측 상단의 toolbox 에 커스텀 "팝업 버튼"을 추가한다.
 * 3. 팝업 버튼을 클릭하면 같은 데이터의 막대차트가 antd Modal 안에서 크게 열린다.
 */
const PopupBarChart: React.FC = () => {
  const [open, setOpen] = useState(false)

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => setOpen(false), [])

  // option 객체를 useMemo 로 고정해 매 렌더마다 차트가 갱신되지 않게 한다.
  const mainOption = useMemo<EChartsOption>(() => buildMainOption(openModal), [openModal])
  const modalOption = useMemo<EChartsOption>(buildModalOption, [])

  // 모달 안 차트 인스턴스 (echarts-for-react 의 ref → getEchartsInstance())
  // 기존 예제(BrushExample 등)와 동일하게 any 로 타입을 느슨하게 둔다.
  const modalChartRef = useRef<any>(null)

  // 모달 오픈 애니메이션이 끝난 직후 차트를 최종 크기로 다시 리사이즈
  const handleAfterOpenChange = useCallback((visible: boolean) => {
    if (!visible) return
    requestAnimationFrame(() => {
      modalChartRef.current?.getEchartsInstance().resize()
    })
  }, [])

  return (
    <div className="card-section">
      <Title level={4} style={{ marginTop: 0 }}>
        막대차트 팝업 예제 (Toolbox 커스텀 버튼 + Modal)
      </Title>
      <Paragraph type="secondary">
        차트 우측 상단 <strong>toolbox</strong>의 <strong>팝업 버튼</strong>(↗ 아이콘)을 클릭하면
        같은 데이터의 막대차트가 <strong>모달창(팝업)</strong>으로 크게 열립니다.
      </Paragraph>

      <div
        style={{
          width: '100%',
          height: 420,
          background: 'white',
          padding: 12,
          borderRadius: 8,
          border: '1px solid #f0f0f0',
        }}
      >
        <Suspense
          fallback={
            <div
              style={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
              }}
            >
              Loading chart...
            </div>
          }
        >
          <ReactECharts option={mainOption} notMerge style={{ height: 400 }} />
        </Suspense>
      </div>

      {/* ⭐ toolbox 의 팝업 버튼이 여는 모달창 */}
      <Modal
        title="막대차트 팝업 (모달창)"
        open={open}
        onCancel={closeModal}
        footer={null}
        width="85%"
        style={{ top: 40 }}
        afterOpenChange={handleAfterOpenChange}
      >
        <Suspense
          fallback={
            <div
              style={{
                height: 480,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
              }}
            >
              Loading chart...
            </div>
          }
        >
          <ReactECharts ref={modalChartRef} option={modalOption} notMerge style={{ height: 480 }} />
        </Suspense>
      </Modal>
    </div>
  )
}

export default PopupBarChart
