import { Suspense } from 'react'
import { Card, Tabs, Typography } from 'antd'
import SimpleLineChart from './SimpleLineChart'
import MyChart from './MyChart'
import { useTabStore, RESIZE_UUID, ChartTab } from '../stores/tabStore'

const { Title, Paragraph } = Typography

/**
 * antd Tabs 를 이용한 차트 탭 예제 (zustand 기반 리팩터링)
 * - 탭 목록/활성 탭/refetch 의도는 전부 `useTabStore`(zustand)가 관리한다.
 * - 부모는 이제 "껍데기" 만 담당한다:
 *   ① Tabs 를 store 의 activeUuid 에 맞춰 렌더링
 *   ② onChange(탭 클릭) → store.setActiveByTabClick (이동만, refetch 의도 없음)
 *   ③ 탭 A(SimpleLineChart) 버튼 → store.navigateWithRefetch (이동 + refetch 의도)
 * - 각 MyChart(B) 는 스스로 store 를 구독해 "자기가 대상+활성이면 refetch" 한다.
 *   → 부모의 chartRefs Map / refetchAndOpen 이 더 이상 필요 없다.
 *
 * ⚠️ echarts 기반 차트는 숨겨진 탭에서 크기가 0으로 초기화될 수 있으므로,
 *    MyChart 가 "활성화 시 자기 스스로 리사이즈" 한다.
 */
const ChartTabExample: React.FC = () => {
  // zustand 에서 탭 정보 읽기
  const tabs = useTabStore((s) => s.tabs)
  const activeUuid = useTabStore((s) => s.activeUuid)
  const setActiveByTabClick = useTabStore((s) => s.setActiveByTabClick)
  const navigateWithRefetch = useTabStore((s) => s.navigateWithRefetch)
  const addChartTab = useTabStore((s) => s.addChartTab)

  const secondTabData = [23, 45, 32, 67, 54, 78, 61]

  // ⭐ 탭 A 버튼 → 고정 탭 B(RESIZE_UUID) 로 이동 + refetch 의도 표시
  //    (탭 A에서 uuid 를 "셋팅" 후 B로 이동한다고 보면 된다)
  const openMyChartWithRefetch = () => navigateWithRefetch(RESIZE_UUID)

  // ⭐ 탭 A 버튼 → 새 MyChart 탭(B) 을 동적으로 추가하고 그 uuid 로 이동 + refetch
  const addDynamicMyChartTab = () => {
    const uuid = addChartTab() // store 가 새 uuid 발급
    navigateWithRefetch(uuid)
  }

  const items = tabs.map((tab: ChartTab) => {
    if (tab.kind === 'line') {
      // 탭 A: SimpleLineChart (여기 버튼이 refetch 의도를 만든다)
      return {
        key: tab.key,
        label: tab.label,
        children: (
          <Suspense fallback={<div>Loading chart...</div>}>
            <SimpleLineChart
              onOpenMyChart={openMyChartWithRefetch}
              onAddDynamicMyChart={addDynamicMyChartTab}
            />
          </Suspense>
        ),
      }
    }
    // 탭 B: MyChart — id(=uuid) 로 queryKey 가 분리되고,
    //        MyChart 내부에서 "자기가 refetch 대상+활성일 때" 스스로 refetch/리사이즈 한다
    return {
      key: tab.key,
      label: tab.label,
      children: <MyChart data={secondTabData} id={tab.key} />,
    }
  })

  return (
    <Card className="card-section" style={{ marginTop: 0 }}>
      <Title level={4} style={{ marginTop: 0 }}>
        Tabs 안에 차트 배치 (antd + zustand)
      </Title>
      <Paragraph type="secondary">
        탭 목록·활성 탭·refetch 의도는 <strong>useTabStore(zustand)</strong>가 관리합니다.{' '}
        <strong>탭 A의 버튼</strong>으로 이동할 때만 대상 MyChart(B)가 refetch 되고,{' '}
        <strong>탭을 클릭</strong>해서 B에 들어가면 refetch 되지 않습니다 (리사이즈만 수행).
      </Paragraph>

      <Tabs activeKey={activeUuid ?? undefined} onChange={setActiveByTabClick} items={items} />
    </Card>
  )
}

export default ChartTabExample
