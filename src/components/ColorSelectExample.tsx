import React, { useState } from 'react'
import { Card, Select, Input, Checkbox, Space, Typography, Divider, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Text } = Typography

// 1. 색상 정의 (10개)
const colorOptions = [
  { value: 'red', label: '빨강 (Red)', color: '#ff4d4f' },
  { value: 'volcano', label: '볼케이노 (Volcano)', color: '#fa541c' },
  { value: 'orange', label: '주황 (Orange)', color: '#fa8c16' },
  { value: 'gold', label: '골드 (Gold)', color: '#faad14' },
  { value: 'yellow', label: '노랑 (Yellow)', color: '#fadb14' },
  { value: 'lime', label: '라임 (Lime)', color: '#a0d911' },
  { value: 'green', label: '초록 (Green)', color: '#52c41a' },
  { value: 'cyan', label: '시안 (Cyan)', color: '#13c2c2' },
  { value: 'blue', label: '파랑 (Blue)', color: '#1677ff' },
  { value: 'purple', label: '보라 ((Purple)))', color: '#722ed1' },
]

// 2. 동그라미 색상 아이콘 컴포넌트
const CircleIcon: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: color,
      boxShadow: '0 0 2px rgba(0, 0, 0, 0.3)',
      flexShrink: 0,
      marginRight: 6,
    }}
  />
)

const ColorSelectExample: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>(['blue', 'green', 'yellow', 'purple'])
  const [searchText, setSearchText] = useState('')

  // 검색어에 맞게 목록 필터링
  const filteredColors = colorOptions.filter((item) =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  )

  // 검색창에서 엔터 키 입력 시 처리
  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()

    if (e.key === 'Enter') {
      if (filteredColors.length === 0) {
        message.warning('검색 결과가 없습니다.')
        return
      }

      const firstMatch = filteredColors[0]

      if (selectedValues.includes(firstMatch.value)) {
        setSelectedValues(selectedValues.filter((v) => v !== firstMatch.value))
        message.info(`'${firstMatch.label}' 선택 해제됨`)
      } else {
        setSelectedValues([...selectedValues, firstMatch.value])
        message.success(`'${firstMatch.label}' 선택됨`)
      }

      setSearchText('')
    }
  }

  // 앞쪽에 Checkbox가 적용된 Options 생성
  const options = filteredColors.map((item) => {
    const isChecked = selectedValues.includes(item.value)
    return {
      value: item.value,
      label: (
        <Space align="center" size={8}>
          <Checkbox checked={isChecked} style={{ pointerEvents: 'none' }} />
          <CircleIcon color={item.color} />
          <span>{item.label}</span>
        </Space>
      ),
    }
  })

  return (
    <Card title="🎨 한 줄 반응형 Select (앞쪽 체크박스 + 검색 입력창)" className="card-section" style={{ maxWidth: 550 }}>
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <Text type="secondary">
          옵션 앞쪽에 일반 체크박스가 위치하며, 반응형으로 **상자 높이가 항상 한 줄로 고정**됩니다.
        </Text>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            다중 선택 (앞쪽 체크박스 + 한 줄 고정)
          </Text>
          <Select
            mode="multiple"
            maxTagCount="responsive"
            style={{ width: '100%' }}
            placeholder="색상을 선택해 주세요"
            value={selectedValues}
            onChange={(val) => setSelectedValues(val)}
            options={options}
            dropdownRender={(menu) => (
              <div>
                {/* 1. 드롭다운 목록 상단 검색용 Input 상자 */}
                <div style={{ padding: '8px 8px 4px 8px' }}>
                  <Input
                    placeholder="검색 후 Enter 키를 눌러 선택하세요..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={handleSearchEnter}
                    allowClear
                  />
                </div>
                <Divider style={{ margin: '4px 0' }} />
                {/* 2. 실제 옵션 목록 */}
                {menu}
              </div>
            )}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <Text>현재 선택된 값 ({selectedValues.length}개): </Text>
          <Text strong code>
            {selectedValues.join(', ') || '없음'}
          </Text>
        </div>
      </Space>
    </Card>
  )
}

export default ColorSelectExample
