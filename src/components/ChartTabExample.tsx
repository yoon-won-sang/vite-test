import { Suspense, useState } from 'react'
import { Card, Tabs, Typography } from 'antd'
import SimpleLineChart from './SimpleLineChart'
import MyChart from './차트높이리사지징스니펫'

const { Title, Paragraph } = Typography

/**
 * antd Tabs 를 이용한 차트 탭 예제
 * - 첫 번째 탭: SimpleLineChart
 * - 두 번째 탭: MyChart (탭 변경 시점에 리사이즈하는 차트)
 *
 * ⚠️ echarts-for-react 기반 차트는 `display:none`(숨겨진 탭)에서 크기가 0으로 초기화될 수
 * 있으므로, 탭 안에 차트를 넣을 때는 반드시 리사이즈 처리가 필요합니다.
 *
 * 💡 두 번째 탭(MyChart)은 antd Tabs 의 onChange(탭 변경 시점)에서 resizeSignal 을
 *    증가시켜, 그 시점에 최종 크기로 리사이즈 하도록 합니다.
 */
const ChartTabExample: React.FC = () => {
  // 두 번째 탭 차트에 넣을 샘플 데이터
  const secondTabData = [23, 45, 32, 67, 54, 78, 61]

  // 탭 변경 시점을 알리는 신호 (변경할 때마다 +1)
  const [resizeVersion, setResizeVersion] = useState(0)

  return (
    <Card className="card-section" style={{ marginTop: 0 }}>
      <Title level={4} style={{ marginTop: 0 }}>
        Tabs 안에 차트 배치 (antd)
      </Title>
      <Paragraph type="secondary">
        첫 번째 탭에는 <strong>SimpleLineChart</strong>, 두 번째 탭에는{' '}
        <strong>탭 변경 시점 리사이즈 차트</strong>를 배치했습니다. 탭을 전환할 때 차트가 0
        크기로 그려지지 않도록 리사이즈가 동작하는지 확인해 보세요.
      </Paragraph>

      <Tabs
        defaultActiveKey="line"
        onChange={() => setResizeVersion((v) => v + 1)}
        items={[
          {
            key: 'line',
            label: '라인차트 (SimpleLineChart)',
            children: (
              <Suspense fallback={<div>Loading chart...</div>}>
                <SimpleLineChart />
              </Suspense>
            ),
          },
          {
            key: 'resize',
            label: '리사이즈 처리 차트',
            children: <MyChart data={secondTabData} resizeSignal={resizeVersion} />,
          },
        ]}
      />
    </Card>
  )
}

export default ChartTabExample
