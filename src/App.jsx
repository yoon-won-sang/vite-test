import { useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { Button, Card, Input, Space, Table, Tag, message } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import './App.css'

function App() {
  const [rowData, setRowData] = useState([
    { id: 1, name: 'John Doe', age: 28, department: 'Engineering', status: 'Active' },
    { id: 2, name: 'Jane Smith', age: 34, department: 'Marketing', status: 'Active' },
    { id: 3, name: 'Bob Johnson', age: 45, department: 'Finance', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', age: 29, department: 'Engineering', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', age: 38, department: 'Sales', status: 'Active' },
  ])

  const [searchText, setSearchText] = useState('')
  const [gridApi, setGridApi] = useState(null)

  const columnDefs = [
    { field: 'id', headerName: 'ID', width: 80, sortable: true, filter: true },
    { field: 'name', headerName: 'Name', width: 150, sortable: true, filter: true },
    { field: 'age', headerName: 'Age', width: 100, sortable: true, filter: true },
    { field: 'department', headerName: 'Department', width: 150, sortable: true, filter: true },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const color = params.value === 'Active' ? 'green' : 'red'
        return <Tag color={color}>{params.value}</Tag>
      },
    },
  ]

  const onGridReady = (params) => {
    setGridApi(params.api)
  }

  const handleSearch = (value) => {
    setSearchText(value)
    if (gridApi) {
      gridApi.setQuickFilter(value)
    }
  }

  const handleAddEmployee = () => {
    message.success('Add employee feature coming soon!')
  }

  const handleExport = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv()
      message.success('Data exported as CSV!')
    }
  }

  const antdColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 100,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Active' ? 'green' : 'red'
        return <Tag color={color}>{status}</Tag>
      },
    },
  ]

  return (
    <div className="app-container">
      <div className="header">
        <h1>🚀 Vite + React + ag-Grid + Ant Design</h1>
        <p>Employee Management System Example</p>
      </div>

      <div className="content">
        {/* Ant Design Table Section */}
        <Card title="Ant Design Table Component" className="card-section">
          <Space direction="vertical" style={{ width: '100%', gap: '16px' }}>
            <Space>
              <Input.Search
                placeholder="Search employees..."
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 300 }}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEmployee}>
                Add Employee
              </Button>
            </Space>
            <Table
              columns={antdColumns}
              dataSource={rowData.filter(
                (item) =>
                  searchText === '' ||
                  item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  item.department.toLowerCase().includes(searchText.toLowerCase())
              )}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              bordered
            />
          </Space>
        </Card>

        {/* ag-Grid Section */}
        <Card title="ag-Grid Component" className="card-section">
          <Space style={{ marginBottom: '16px' }}>
            <Input.Search
              placeholder="Quick filter..."
              allowClear
              style={{ width: 300 }}
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
      </div>

      <footer className="footer">
        <p>
          Built with <strong>Vite</strong> • <strong>React</strong> • <strong>ag-Grid</strong> • <strong>Ant Design</strong>
        </p>
      </footer>
    </div>
  )
}

export default App
