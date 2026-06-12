import { Card, Button, Space, message } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import { useState, useMemo, useEffect } from 'react'
import type { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community'
import type { Employee } from '../types/employee'

interface CheckboxGridSectionProps {
  rowData: Employee[]
}

// 체크박스 상태를 데이터로 관리하기 위한 타입 확장
interface DynamicEmployee extends Employee {
  [key: string]: any // 동적 필드 지원을 위해 인덱스 시그니처 추가
}

// 동적으로 생성할 체크박스 컬럼 설정 리스트
const DYNAMIC_CHECKBOX_COLS = [
  { field: 'isManager', headerName: 'Manager' },
  { field: 'checked', headerName: 'Selected' },
  { field: 'verified', headerName: 'Verified' },
]

function CheckboxGridSection({ rowData }: CheckboxGridSectionProps) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [localData, setLocalData] = useState<DynamicEmployee[]>([])

  // 외부에서 받은 rowData에 동적 필드들을 추가하여 로컬 상태로 관리합니다.
  useEffect(() => {
    setLocalData(
      rowData.map((row) => ({
        ...row,
        // 모든 동적 컬럼 필드를 초기화 (기본값 false, verified는 샘플 조건 적용)
        ...DYNAMIC_CHECKBOX_COLS.reduce(
          (acc, col) => ({
            ...acc,
            [col.field]: col.field === 'verified' ? row.id % 3 === 0 : false,
          }),
          {},
        ),
      })),
    )
  }, [rowData])

  // 컬럼 정의: 동적 리스트를 기반으로 체크박스 컬럼들을 생성합니다.
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      { field: 'name', headerName: 'Name', width: 150 },
      ...DYNAMIC_CHECKBOX_COLS.map((col) => ({
        field: col.field,
        headerName: col.headerName,
        width: 120,
        editable: true,
        cellRenderer: 'agCheckboxCellRenderer',
        cellEditor: 'agCheckboxCellEditor',
      })),
      { field: 'age', headerName: 'Age', width: 100 },
      { field: 'department', headerName: 'Department', width: 150 },
      { field: 'status', headerName: 'Status', width: 120 },
    ],
    [],
  )

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api)
  }

  // 버튼 클릭 시 동적으로 정의된 모든 체크박스 필드의 상태를 요약하여 보여줍니다.
  const handleCheckData = () => {
    if (gridApi) {
      const rows: DynamicEmployee[] = []
      gridApi.forEachNode((node) => rows.push(node.data))

      const summary = DYNAMIC_CHECKBOX_COLS.map((col) => {
        const count = rows.filter((r) => r[col.field]).length
        return `${col.headerName}: ${count}`
      }).join(', ')

      message.info(summary)
      console.log('Current Grid Data:', rows)
    }
    //NeoVim은 한글문제가 없구나.
    //테스트 코드이다. 컬럼키값 배열집합으로 ag-grid 형태의 배열로우집합을 탐색한다.
    //전체가 false 인가를 검색하는 부분
    if (gridApi) {
      const rows: DynamicEmployee[] = []
      gridApi.forEachNode((node) => rows.push(node.data))
      console.log('Current Grid Data:', rows)
      const selectedIds = ['1', '3', '5']
      const rowData = [
        { id: '1', useYn: false },
        { id: '2', useYn: true },
        { id: '3', useYn: false },
        { id: '4', useYn: false },
        { id: '5', useYn: false },
      ]
      const idSet = new Set(selectedIds)
      const isAllFalse = rowData
        .filter((row) => idSet.has(row.id))
        .every((row) => row.useYn === false)
      console.log(isAllFalse) // true
      const columnDef = gridApi.getColumnDefs()
      console.log('🚀 ~ handleCheckData ~ columnDef:', columnDef)

      message.info('success')
    }
  }

  return (
    <Card title="ag-Grid 셀 단위 체크박스 (Boolean 편집) 예제" className="card-section">
      <Space style={{ marginBottom: '16px' }}>
        <Button type="primary" onClick={handleCheckData}>
          체크된 데이터 확인
        </Button>
      </Space>

      <div className="ag-theme-quartz" style={{ width: '100%', height: '500px' }}>
        <AgGridReact
          rowData={localData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </Card>
  )
}

export default CheckboxGridSection
