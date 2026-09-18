import { useState } from 'react'
import { Button, Input, Space, Typography, Alert } from 'antd'
import { useModalStore } from '../stores/modalStore'


const { Title, Text } = Typography

const NestedModal: React.FC = () => (
  <div style={{ padding: '20px' }}>
    <p>이것은 중첩된 모달입니다!</p>
  </div>
)

/**
 * 모달 안에서 편집할 이름 컴포넌트.
 */
const NameEditor: React.FC<{ id: string; name: string; onChange: (v: string) => void }> = ({
  name,
  onChange,
}) => {
  const openModal = useModalStore((s) => s.openModal)

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이름을 입력하세요"
        size="large"
      />
      <Alert
        message={`모달 내부에서도 동기화: ${name}`}
        type="success"
        showIcon
      />
      <Button onClick={() => openModal(NestedModal, { title: '중첩된 모달' })}>
        중첩 모달 열기
      </Button>
    </Space>
  )
}

/**
 * zustand openModal 예제 데모 컴포넌트.
 */
export const ZustandModalDemo: React.FC = () => {
  const [name, setName] = useState('홍길동')

  const openModal = useModalStore((s) => s.openModal)
  const updateModalProps = useModalStore((s) => s.updateModalProps)

  const handleOpenModal = () => {
    let modalId = ''
    modalId = openModal(NameEditor, {
      title: '이름 편집 모달',
      width: 400,
      props: {
        id: modalId,
        name,
        onChange: (newName: string) => {
          setName(newName)
          updateModalProps(modalId, { name: newName })
        }
      },
    })
  }

  return (
    <div className="card-section">
      <Title level={4}>zustand 모달 동기화 예제</Title>
      <div style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>현재 이름: <Text strong>{name}</Text></Text>
          <Button type="primary" onClick={handleOpenModal}>
            편집하기
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default ZustandModalDemo
