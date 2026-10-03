import React, { useState } from 'react'
import { Card, Table, Button, Space, message, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'

interface Fruit {
  id: number
  name: string
  score: number
}

const ScoreGridExample: React.FC = () => {
  const [tableData, setTableData] = useState<Fruit[]>([])
  const [gridData, setGridData] = useState<Fruit[]>([])
  const [tableLoading, setTableLoading] = useState(false)
  const [gridLoading, setGridLoading] = useState(false)

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '과일 이름', dataIndex: 'name', key: 'name' },
    { title: '점수', dataIndex: 'score', key: 'score' },
  ]

  const gridColumnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 100, sort: 'desc' },
    { field: 'name', headerName: '과일 이름', flex: 1 },
    { field: 'score', headerName: '점수', width: 100 },
  ]

  const handleSearch = () => {
    setGridLoading(true)
    setTableLoading(true)
    setTableData([]) // 초기화
    setGridData([]) // 그리드 데이터도 초기화

    // 1. 하단 그리드 데이터 먼저 세팅
    setTimeout(() => {
      const newGridData = Array.from({ length: 2000 }, (_, i) => ({
        id: i + 1,
        name: `과일-${i + 1}`,
        score: Math.floor(Math.random() * 100),
      })).sort((a, b) => b.id - a.id)
      setGridData(newGridData)
      setGridLoading(false)
      // 하단 그리드가 데이터 세팅 후 렌더링 완료되길 기다린 후 상단 업데이트 (시뮬레이션)
    }, 500)
  }

  const onGridReady = () => {
    console.log('Grid Ready')
  }

  const handleDataRendered = () => {
    // gridData가 비어있지 않고 tableLoading 중일 때만 상단 테이블 업데이트
    if (gridData.length === 0 || !tableLoading) return

    // 그리드가 데이터 렌더링 완료되면 상단 테이블 업데이트
    setTimeout(() => {
      const newTableData = Array.from({ length: 2000 }, (_, i) => ({
        id: i + 1,
        name: `과일-${i + 1}`,
        score: Math.floor(Math.random() * 100),
      })).sort((a, b) => b.id - a.id)
      setTableData(newTableData)
      setTableLoading(false)
      message.success('하단 그리드 로드 후 상단 테이블 업데이트 완료')
    }, 500)
  }

  return (
    <Card title="스코어 테이블 및 과일 목록 그리드 예제">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleSearch} loading={gridLoading || tableLoading}>
          조회
        </Button>
      </Space>

      <div style={{ marginBottom: 24 }}>
        <h3>상단 스코어 테이블 (2,000개, 높이 200px)</h3>
        <Spin spinning={tableLoading}>
          <Table
            dataSource={tableData}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ y: 200 }}
          />
        </Spin>
      </div>

      <div className="ag-theme-quartz" style={{ height: '200px', width: '100%', position: 'relative' }}>
        <AgGridReact
          rowData={gridData}
          columnDefs={gridColumnDefs}
          onGridReady={onGridReady}
          onRowDataUpdated={handleDataRendered}
        />
        {gridLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.7)',
            zIndex: 1
          }}>
            <Spin />
          </div>
        )}
      </div>
    </Card>
  )
}

export default ScoreGridExample
