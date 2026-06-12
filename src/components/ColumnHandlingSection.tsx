import { useState, useMemo } from 'react'
import { Card, Button, Space, message, Divider, Tag } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ColGroupDef, GridReadyEvent, GridApi } from 'ag-grid-community'
import type { Employee } from '../types/employee'

/**
 * ag-Grid의 getColumnDefs()는 (ColDef | ColGroupDef)[]를 반환합니다.
 * 특정 컬럼의 'field'를 다루기 위해 ColDef인지 확인하는 타입 가드 함수입니다.
 */
function isColDef<T>(col: ColDef<T> | ColGroupDef<T>): col is ColDef<T> {
  return (col as ColDef<T>).field !== undefined
}

function ColumnHandlingSection({ rowData }: { rowData: Employee[] }) {
  const [gridApi, setGridApi] = useState<GridApi<Employee> | null>(null)

  // 초기 컬럼 정의
  const initialColumnDefs = useMemo<ColDef<Employee>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80, pinned: 'left' },
      { field: 'name', headerName: '성명', width: 150 },
      { field: 'age', headerName: '나이', width: 100 },
      { field: 'department', headerName: '부서', width: 150 },
      { field: 'status', headerName: '상태', width: 120 },
    ],
    [],
  )

  const onGridReady = (params: GridReadyEvent<Employee>) => {
    setGridApi(params.api)
  }

  /**
   * 예제 1: 특정 필드를 찾아 숨기기/보이기 토글
   * getColumnDefs()로 현재 상태를 가져와 수정 후 setGridOption으로 반영합니다.
   */
  const toggleColumnVisibility = (field: keyof Employee) => {
    if (!gridApi) return

    const currentDefs = gridApi.getColumnDefs()
    if (!currentDefs) return

    const nextDefs = currentDefs.map((col) => {
      if (isColDef(col) && col.field === field) {
        return { ...col, hide: !col.hide }
      }
      return col
    })

    // v31+ 에서는 setGridOption을 권장하며, 이전 버전은 setColumnDefs 사용 가능
    gridApi.setGridOption('columnDefs', nextDefs)
    message.success(`${String(field)} 컬럼 상태가 변경되었습니다.`)
  }

  /**
   * 예제 2: 특정 필드의 헤더명을 동적으로 변경
   */
  const renameHeader = (field: keyof Employee, newName: string) => {
    if (!gridApi) return

    const currentDefs = gridApi.getColumnDefs()
    if (!currentDefs) return

    const nextDefs = currentDefs.map((col) => {
      if (isColDef(col) && col.field === field) {
        return { ...col, headerName: newName }
      }
      return col
    })

    gridApi.setGridOption('columnDefs', nextDefs)
  }

  /**
   * 예제 3: 특정 필드만 강조 스타일 적용 (cellClass 변경)
   */
  const highlightColumn = (field: keyof Employee) => {
    if (!gridApi) return

    const currentDefs = gridApi.getColumnDefs()
    if (!currentDefs) return

    const nextDefs = currentDefs.map((col) => {
      if (isColDef(col) && col.field === field) {
        // 기존 스타일이 있으면 제거, 없으면 추가
        const hasHighlight = col.cellClass === 'highlight-cell'
        return {
          ...col,
          cellClass: hasHighlight ? undefined : 'highlight-cell',
        }
      }
      return col
    })

    gridApi.setGridOption('columnDefs', nextDefs)
  }

  return (
    <Card title="Column Field Handling Examples" className="card-section">
      <div style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Tag color="blue">Visibility:</Tag>
            <Button size="small" onClick={() => toggleColumnVisibility('age')}>
              나이 컬럼 토글
            </Button>
            <Button size="small" onClick={() => toggleColumnVisibility('status')}>
              상태 컬럼 토글
            </Button>
          </Space>

          <Space wrap>
            <Tag color="green">Rename:</Tag>
            <Button size="small" onClick={() => renameHeader('department', '소속 부서')}>
              부서명 변경
            </Button>
            <Button size="small" onClick={() => renameHeader('name', 'Employee Name')}>
              성명 영문으로
            </Button>
          </Space>

          <Space wrap>
            <Tag color="orange">Style:</Tag>
            <Button size="small" danger onClick={() => highlightColumn('id')}>
              ID 컬럼 강조/해제
            </Button>
          </Space>
        </Space>
      </div>

      <Divider />

      <div className="ag-theme-quartz" style={{ width: '100%', height: '400px' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={initialColumnDefs}
          onGridReady={onGridReady}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
            resizable: true,
            sortable: true,
          }}
        />
      </div>

      <style>{`
        .highlight-cell {
          background-color: #fff7e6 !important;
          font-weight: bold;
          color: #d46b08;
        }
      `}</style>
    </Card>
  )
}

export default ColumnHandlingSection
