import { useMemo, useState } from 'react'
import { Card, Input, Row, Col, Statistic, Tag, Divider, Typography, Space } from 'antd'

const { TextArea } = Input
const { Text, Paragraph } = Typography

// 문자열 연산 예제 - 입력값을 수정하면 화면에 즉시 반영됩니다.
function StringOperations() {
  const [text, setText] = useState('Hello React! 한글 문자열 연산 예제입니다. 123')

  // 입력값이 바뀔 때마다 자동으로 재계산됩니다. (useMemo)
  const result = useMemo(() => {
    const trimmed = text
    const noSpaces = trimmed.replace(/\s/g, '')
    const words = trimmed.trim() === '' ? [] : trimmed.trim().split(/\s+/)

    return {
      length: trimmed.length, // 전체 길이 (공백 포함)
      charCount: noSpaces.length, // 공백 제외 길이
      wordCount: words.length, // 단어 개수
      upper: trimmed.toUpperCase(),
      lower: trimmed.toLowerCase(),
      reverse: trimmed.split('').reverse().join(''),
      reverseWords: words.slice().reverse().join(' '),
      noVowels: trimmed.replace(/[aeiouAEIOU]/g, ''),
      noSpacesStr: noSpaces,
      isPalindrome: (() => {
        const normalized = noSpaces.toLowerCase()
        return normalized === normalized.split('').reverse().join('')
      })(),
      customStr: (() => {
        // 값이 있으면 괄호 포함, 없으면 괄호 없이 "문자열"만 출력
        return text.trim() ? `문자열 ( ${text} )` : '문자열'
      })(),
    }
  }, [text])

  return (
    <Card title="🔤 문자열 연산 예제 (입력 즉시 반영)" className="card-section">
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        아래 입력창의 텍스트를 수정하면, 모든 연산 결과가 <Text strong>즉시</Text> 갱신됩니다.
      </Paragraph>

      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="문자열을 입력하세요..."
        autoSize={{ minRows: 2, maxRows: 6 }}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Statistic title="전체 길이 (공백 포함)" value={result.length} />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic title="공백 제외 길이" value={result.charCount} />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic title="단어 개수" value={result.wordCount} />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="회문 여부"
            value={result.isPalindrome ? '회문' : '아님'}
            valueStyle={{ color: result.isPalindrome ? '#52c41a' : '#ff4d4f' }}
          />
        </Col>
      </Row>

      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <OperationRow label="커스텀" value={result.customStr} />
        <OperationRow label="대문자" value={result.upper} />
        <OperationRow label="소문자" value={result.lower} />
        <OperationRow label="전체 뒤집기" value={result.reverse} />
        <OperationRow label="단어 순서 뒤집기" value={result.reverseWords} />
        <OperationRow label="모음 제거" value={result.noVowels} />
        <OperationRow label="공백 제거" value={result.noSpacesStr} />
      </Space>
    </Card>
  )
}

interface OperationRowProps {
  label: string
  value: string
}

function OperationRow({ label, value }: OperationRowProps) {
  return (
    <div>
      <Tag color="blue">{label}</Tag>
      <Paragraph code style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {value || '(결과 없음)'}
      </Paragraph>
    </div>
  )
}

export default StringOperations
