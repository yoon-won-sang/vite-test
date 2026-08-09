import { Card, Button, Space, InputNumber, Divider, Tag, Typography, Statistic } from 'antd'
import { useState } from 'react'
import { useCounterStore } from '../stores/counterStore'

const { Text, Title, Paragraph } = Typography

// ---------------------------------------------------------------
// zustand 기본 예제
// 1) 스토어에서 count 를 직접 조회 (+1 / -1 / reset)
// 2) 하위 컴포넌트들이 "같은" 스토어를 구독해 상태를 공유함을 확인
// ---------------------------------------------------------------
function ZustandExample() {
  // zustand 훅으로 전역 상태와 액션을 꺼내온다.
  const history = useCounterStore((s) => s.history)
  const increase = useCounterStore((s) => s.increase)
  const decrease = useCounterStore((s) => s.decrease)
  const reset = useCounterStore((s) => s.reset)

  // +N / -N 버튼에 쓸 로컬 입력값 (zustand 에 저장할 필요 없음)
  const [step, setStep] = useState(1)

  return (
    <Card title="🧩 zustand 기본 예제" className="card-section">
      <Paragraph type="secondary">
        전역 상태를 <Text strong>zustand 스토어</Text>로 관리합니다. 아래의 본문 카운터와
        하위 두 컴포넌트(<Tag>카운터 표시 A</Tag>, <Tag>카운터 표시 B</Tag>)는 모두{' '}
        <Text code>useCounterStore</Text>라는 <strong>같은 스토어</strong>를 구독하므로, 어디서
        값을 바꿔도 모든 곳에 즉시 반영됩니다.
      </Paragraph>

      {/* 본문: 조작 컨트롤 */}
      <Space wrap style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={() => increase(step)}>
          +{step}
        </Button>
        <Button onClick={() => decrease(step)}>-{step}</Button>
        <Button danger onClick={reset}>
          reset
        </Button>
        <InputNumber
          min={1}
          max={10}
          value={step}
          onChange={(v) => setStep(v ?? 1)}
          style={{ width: 80 }}
        />
      </Space>

      {/* 같음 스토어를 구독하는 하위 컴포넌트 2개 */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <CounterDisplayA />
        <CounterDisplayB />
      </div>

      {/* 상태 변경 로그 (스토어의 history 배열 공유) */}
      <Divider>변경 내역</Divider>
      {history.length === 0 ? (
        <Text type="secondary">아직 기록이 없습니다.</Text>
      ) : (
        history.map((log, i) => <Tag key={i}>{log}</Tag>)
      )}
    </Card>
  )
}

// 하위 컴포넌트 A: 같은 스토어에서 count 만 구독
function CounterDisplayA() {
  const count = useCounterStore((s) => s.count)
  return (
    <Card size="small" style={{ flex: 1, minWidth: 180 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        카운터 표시 A
      </Title>
      <Statistic title="전역 count" value={count} />
    </Card>
  )
}

// 하위 컴포넌트 B: 같은 스토어에서 count 와 액션을 함께 구독
function CounterDisplayB() {
  const count = useCounterStore((s) => s.count)
  const decrease = useCounterStore((s) => s.decrease)
  return (
    <Card size="small" style={{ flex: 1, minWidth: 180 }}>
      <Title level={5} style={{ marginTop: 0 }}>
        카운터 표시 B (여기서도 조작 가능)
      </Title>
      <Space>
        <Statistic title="전역 count" value={count} />
        <Button onClick={() => decrease(1)}>-1</Button>
      </Space>
    </Card>
  )
}

export default ZustandExample
