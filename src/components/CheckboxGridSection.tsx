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
