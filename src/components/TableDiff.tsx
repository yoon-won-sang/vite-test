import { Card, Table, Tag, Button, Space } from 'antd'
import { useState } from 'react'

interface TableDiffProps {
  onClose?: () => void
}

interface DiffResult {
  columnsOnlyInA: string[]
  columnsOnlyInB: string[]
  differentValues: DifferentCell[]
  rowsOnlyInA: number[]
  rowsOnlyInB: number[]
}

interface DifferentCell {
  rowKey: number
  column: string
  valueA: unknown
  valueB: unknown
}

const TableDiff: React.FC<TableDiffProps> = ({ onClose }) => {
  const tableA = [
    { id: 1, name: '홍길동', role: '개발자' },
    { id: 2, name: '김철수', role: '디자이너' },
  ]

  const tableB = [
    { id: 1, name: '홍길동', role: '시니어 개발자' },
    { id: 3, name: '이영희', role: '기획자' },
  ]

  const columns = Object.keys(tableA[0]).map(key => ({
    title: key.toUpperCase(),
    dataIndex: key,
    key,
  }))

  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)

  const compareTables = () => {
    const rowKey = 'id'

    const columnsA = Object.keys(tableA[0])
    const columnsB = Object.keys(tableB[0])

    const columnsOnlyInA = columnsA.filter(c => !columnsB.includes(c))
    const columnsOnlyInB = columnsB.filter(c => !columnsA.includes(c))

    const tableAByKey = new Map(tableA.map(row => [row.id, row]))
    const tableBByKey = new Map(tableB.map(row => [row.id, row]))

    const allIds = new Set([...tableAByKey.keys(), ...tableBByKey.keys()])

    const differentValues: DifferentCell[] = []
    const rowsOnlyInA: number[] = []
    const rowsOnlyInB: number[] = []

    allIds.forEach(id => {
      const rowA = tableAByKey.get(id)
      const rowB = tableBByKey.get(id)

      if (!rowA) {
        rowsOnlyInB.push(id)
        return
      }
      if (!rowB) {
        rowsOnlyInA.push(id)
        return
      }

      const allColumns = [...new Set([...Object.keys(rowA), ...Object.keys(rowB)])]
      allColumns.forEach(col => {
        const valA = rowA[col as keyof typeof rowA]
        const valB = rowB[col as keyof typeof rowB]

        if (valA !== valB) {
          differentValues.push({
            rowKey: id,
            column: col,
            valueA: valA,
            valueB: valB,
          })
        }
      })
    })

    setDiffResult({
      columnsOnlyInA,
      columnsOnlyInB,
      differentValues,
      rowsOnlyInA,
      rowsOnlyInB,
    })
  }

  if (!diffResult) {
    return (
      <Card style={{ padding: 24, textAlign: 'center' }}>
        <h3>두 테이블 비교</h3>
        <p>버튼을 클릭하면 두 테이블의 차이점을 분석합니다.</p>
        <Button type="primary" onClick={compareTables}>
          비교 실행
        </Button>
      </Card>
    )
  }

  const colTitleA = `컬럼 차이 (A전용: ${diffResult.columnsOnlyInA.length}, B전용: ${diffResult.columnsOnlyInB.length})`
  const cellTitle = `값 차이 (총 ${diffResult.differentValues.length}건)`
  const rowTitle = `행 차이 (A전용: ${diffResult.rowsOnlyInA.length}, B전용: ${diffResult.rowsOnlyInB.length})`

  const tableData = diffResult.differentValues.map(dv => ({
    rowKey: dv.rowKey,
    column: dv.column,
    valueA: String(dv.valueA),
    valueB: String(dv.valueB),
  }))

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>테이블 A</h3>
          <Table dataSource={tableA} columns={columns} rowKey="id" pagination={false} size="small" />
        </div>
        <div style={{ flex: 1 }}>
          <h3>테이블 B</h3>
          <Table dataSource={tableB} columns={columns} rowKey="id" pagination={false} size="small" />
        </div>
      </div>

      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        {!diffResult ? (
          <Button type="primary" size="large" onClick={compareTables}>
            비교 실행
          </Button>
        ) : (
          <Space>
            <Button onClick={() => setDiffResult(null)}>초기화</Button>
            <Button type="primary" onClick={compareTables}>
              다시 비교
            </Button>
          </Space>
        )}
      </div>

      {diffResult && (
        <div style={{ marginTop: 24 }}>
          <h3>비교 결과 요약</h3>

          <Card title={colTitleA} bordered style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {diffResult.columnsOnlyInA.map(col => (
                <Tag key={col} color="blue">
                  {col} (A전용)
                </Tag>
              ))}
              {diffResult.columnsOnlyInB.map(col => (
                <Tag key={col} color="green">
                  {col} (B전용)
                </Tag>
              ))}
              {diffResult.columnsOnlyInA.length === 0 && diffResult.columnsOnlyInB.length === 0 && (
                <span style={{ color: '#888' }}>컬럼 차이가 없습니다.</span>
              )}
            </div>
          </Card>

          <Card title={cellTitle} bordered style={{ marginBottom: 16 }}>
            <Table
              dataSource={tableData}
              columns={[
                { title: '행키', dataIndex: 'rowKey', key: 'rowKey' },
                { title: '컬럼', dataIndex: 'column', key: 'column' },
                { title: '테이블A', dataIndex: 'valueA', key: 'valueA' },
                { title: '테이블B', dataIndex: 'valueB', key: 'valueB' },
              ]}
              rowKey="rowKey"
              pagination={false}
              size="small"
            />
          </Card>

          <Card title={rowTitle} bordered>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {diffResult.rowsOnlyInA.map(key => (
                <Tag key={key} color="orange">
                  행 {key} (A전용)
                </Tag>
              ))}
              {diffResult.rowsOnlyInB.map(key => (
                <Tag key={key} color="purple">
                  행 {key} (B전용)
                </Tag>
              ))}
              {diffResult.rowsOnlyInA.length === 0 && diffResult.rowsOnlyInB.length === 0 && (
                <span style={{ color: '#888' }}>행 차이가 없습니다.</span>
              )}
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}

export default TableDiff
