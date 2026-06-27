import { Card } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import { useMemo } from 'react'
import type { ColDef } from 'ag-grid-community'

const TOTAL_ROWS = 300
const TOTAL_COLUMNS = 200

function CheckboxMatrixExample() {
  const columnDefs = useMemo<ColDef[]>(() => {
    const checkboxCols: ColDef[] = Array.from({ length: TOTAL_COLUMNS }, (_, index) => ({
      field: `col_${index + 1}`,
      headerName: `box ${index + 1}`,
      width: 80,
      editable: true,
      cellRenderer: 'agCheckboxCellRenderer',
      cellEditor: 'agCheckboxCellEditor',
    }))

    return [
      {
        field: 'rowLabel',
        width: 110,
        pinned: 'left',
        suppressMovable: true,
      },
      ...checkboxCols,
    ]
  }, [])

  const rowData = useMemo(
    () =>
      Array.from({ length: TOTAL_ROWS }, (_, rowIndex) => {
        const row: Record<string, boolean | string> = {
          rowLabel: `${rowIndex + 1}`,
        }

        for (let colIndex = 0; colIndex < TOTAL_COLUMNS; colIndex += 1) {
          row[`col_${colIndex + 1}`] = (rowIndex + colIndex) % 4 === 0
        }

        return row
      }),
    [],
  )
  console.log('rowData', rowData)
  return (
    <Card title="ag-Grid Checkbox Matrix Example" className="card-section">
      <div className="ag-theme-quartz" style={{ width: '100%', height: '500px' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: false,
            filter: false,
            resizable: false,
            editable: true,
          }}
          // domLayout="autoHeight"
          // rowSelection="multiple"
          rowBuffer={0}
          suppressAnimationFrame={true}
          headerHeight={60}
        />
      </div>
    </Card>
  )
}

export default CheckboxMatrixExample
