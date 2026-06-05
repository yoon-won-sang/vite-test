import { Card, Input, Space, Table, Button } from 'antd'
import { SearchOutlined, PlusOutlined, FileExcelOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Employee } from '../types/employee'

interface EmployeeTableProps {
  rowData: Employee[]
  searchText: string
  setSearchText: (value: string) => void
  handleAddEmployee: () => void
  antdColumns: ColumnsType<Employee>
  loading: boolean
  handleExcelExport: () => void
}

function EmployeeTable({
  rowData,
  searchText,
  setSearchText,
  handleAddEmployee,
  antdColumns,
  loading,
  handleExcelExport,
}: EmployeeTableProps) {
  return (
    <Card title="Ant Design Table Component" className="card-section">
      <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
        <Space wrap>
          <Input.Search
            placeholder="Search employees..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEmployee}>
            Add Employee
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={handleExcelExport}>
            Export to Excel
          </Button>
        </Space>
        <Table
          columns={antdColumns}
          dataSource={rowData.filter(
            (item) =>
              searchText === '' ||
              item.name.toLowerCase().includes(searchText.toLowerCase()) ||
              item.department.toLowerCase().includes(searchText.toLowerCase()),
          )}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
          loading={loading}
        />
      </Space>
    </Card>
  )
}

export default EmployeeTable
