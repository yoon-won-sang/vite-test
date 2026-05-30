import { Card, Button, Input, Space } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, GridReadyEvent } from 'ag-grid-community'
import type { Employee } from '../types/employee'

interface GridSectionProps {
  rowData: Employee[]
  columnDefs: ColDef[]
  onGridReady: (params: GridReadyEvent) => void
  handleSearch: (value: string) => void
  handleExport: () => void
  searchText: string
}

function GridSection({
  rowData,
  columnDefs,
  onGridReady,
  handleSearch,
  handleExport,
  searchText,
}: GridSectionProps) {
  return (
    <Card title="ag-Grid Component" className="card-section">
      <Space style={{ marginBottom: '16px' }}>
        <Input.Search
          placeholder="Quick filter..."
          allowClear
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button onClick={handleExport}>Export to CSV</Button>
      </Space>
      <div className="ag-grid-wrapper">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          quickFilterText={searchText}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          pagination={true}
          paginationPageSize={5}
          domLayout="autoHeight"
        />
      </div>
    </Card>
  )
}

export default GridSection
