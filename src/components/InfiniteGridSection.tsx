import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Card, Button, Input, Space, Spin, Typography, message } from 'antd'
import { FileExcelOutlined, DownloadOutlined } from '@ant-design/icons'
import { AgGridReact } from 'ag-grid-react'
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  IGetRowsParams,
  IInfiniteRowModel,
} from 'ag-grid-community'
import type { Employee } from '../types/employee'

const departmentOptions = ['Engineering', 'Marketing', 'Finance', 'Sales', 'Operations']

const localMockRows: Employee[] = Array.from({ length: 120 }, (_, idx) => {
  const id = idx + 1
  const firstNames = [
    'Alex',
    'Bella',
    'Chris',
    'Dana',
    'Evan',
    'Fiona',
    'Gina',
    'Hugo',
    'Ivy',
    'Jake',
    'Kara',
    'Leo',
  ]
  const lastNames = [
    'Kim',
    'Park',
    'Lee',
    'Choi',
    'Jung',
    'Yoon',
    'Han',
    'Shin',
    'Kwon',
    'Moon',
    'Oh',
    'Seo',
  ]
  const firstName = firstNames[idx % firstNames.length]
  const lastName = lastNames[idx % lastNames.length]

  return {
    id,
    name: `${firstName} ${lastName}`,
    age: 22 + ((id * 7) % 30),
    department: departmentOptions[(id - 1) % departmentOptions.length],
    status: id % 2 === 0 ? 'Inactive' : 'Active',
  }
})

const mapRemoteUserToEmployee = (user: {
  id: number
  firstName: string
  lastName: string
}): Employee => {
  const id = user.id
  return {
    id,
    name: `${user.firstName} ${user.lastName}`,
    age: 22 + ((id * 7) % 30),
    department: departmentOptions[(id - 1) % departmentOptions.length],
    status: id % 2 === 0 ? 'Inactive' : 'Active',
  }
}

interface InfiniteGridSectionProps {
  columnDefs: ColDef[]
  handleSearch: (value: string) => void
  handleExport: () => void
  handleExcelExport: () => void
  onGridReady: (api: GridApi) => void
  searchText: string
}

function InfiniteGridSection({
  columnDefs,
  handleSearch,
  handleExport,
  onGridReady,
  handleExcelExport,
  searchText,
}: InfiniteGridSectionProps) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [totalRows, setTotalRows] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const datasource = useMemo(
    () => ({
      getRows: async (params: IGetRowsParams) => {
        const { startRow, endRow } = params
        const pageSize = endRow - startRow
        const safePageSize = Math.max(1, pageSize)
        setLoading(true)

        try {
          // dummyjson returns paged user data with total count in the body
          const response = await axios.get('https://dummyjson.com/users', {
            params: {
              limit: safePageSize,
              skip: startRow,
            },
          })

          interface DummyUser {
            id: number
            firstName: string
            lastName: string
          }
          const users = response.data.users as DummyUser[]
          const rowsThisPage = users.map((u) => mapRemoteUserToEmployee(u))
          const totalCount = typeof response.data.total === 'number' ? response.data.total : null

          if (totalCount !== null) {
            setTotalRows(totalCount)
            params.successCallback(rowsThisPage, totalCount)
          } else {
            params.successCallback(
              rowsThisPage,
              rowsThisPage.length < safePageSize ? startRow + rowsThisPage.length : -1,
            )
          }
        } catch (err) {
          // show a message and log for debugging
          console.error('Failed to load rows', err)
          message.error('Failed to load grid data, using fallback')

          const fallbackRows = localMockRows.slice(startRow, startRow + safePageSize)
          setTotalRows(localMockRows.length)
          params.successCallback(fallbackRows, localMockRows.length)
        } finally {
          setLoading(false)
        }
      },
    }),
    [],
  )

  const handleGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api)
    ;(params.api.getModel() as IInfiniteRowModel).setDatasource(datasource)
    onGridReady(params.api)
  }

  return (
    <Card title="ag-Grid Infinite Scrolling" className="card-section">
      <Space style={{ marginBottom: '16px', width: '100%' }} wrap>
        <Input.Search
          placeholder="Search by name..."
          allowClear
          style={{ width: 320 }}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={!gridApi}>
          Export CSV
        </Button>
        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          onClick={handleExcelExport}
          disabled={!gridApi}
        >
          Excel Export
        </Button>
        <Typography.Text type="secondary">
          Total rows available: {totalRows ?? 'Loading...'}
        </Typography.Text>
      </Space>

      <div className="ag-grid-wrapper">
        {loading && totalRows === null ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div className="ag-theme-quartz" style={{ width: '100%', height: '560px' }}>
            <AgGridReact
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                floatingFilter: true,
              }}
              rowModelType="infinite"
              cacheBlockSize={20} // 한 번에 불러올 로우 수
              infiniteInitialRowCount={20} // 초기 렌더링 시 보여줄 빈 로우 수
              onGridReady={handleGridReady}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

export default InfiniteGridSection
