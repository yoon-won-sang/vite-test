import { useEffect, useState } from 'react'
import axios from 'axios'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { Form, Tag, message } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { GridApi, GridReadyEvent } from 'ag-grid-community'
import EmployeeTable from './components/EmployeeTable'
import EmployeeForm from './components/EmployeeForm'
import GridSection from './components/GridSection'
import type { Employee, EmployeeFormValues } from './types/employee'
import './App.css'

function App() {
  const [localRows, setLocalRows] = useState<Employee[]>([])
  const [searchText, setSearchText] = useState('')
  const [gridApi, setGridApi] = useState<GridApi | null>(null)

  const queryResult = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users')
      const departmentOptions = ['Engineering', 'Marketing', 'Finance', 'Sales', 'Operations']
      const users = response.data as Array<{ id: number; name: string }>

      return users.map((user) => ({
        id: user.id,
        name: user.name,
        age: 22 + ((user.id * 7) % 30),
        department: departmentOptions[(user.id - 1) % departmentOptions.length],
        status: user.id % 2 === 0 ? 'Inactive' : 'Active',
      }))
    },
    staleTime: 1000 * 60 * 5,
  })

  const fetchedRows = queryResult.data ?? []
  const rowData = [...fetchedRows, ...localRows]

  useEffect(() => {
    if (queryResult.isError) {
      message.error('Failed to load employee data from jsonplaceholder.')
    }
  }, [queryResult.isError])

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
      cellRenderer: (params: any) => {
        const color = params.value === 'Active' ? 'green' : 'red'
        return <Tag color={color}>{params.value}</Tag>
      },
    },
  ]

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api)
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (gridApi) {
      ;(gridApi as any).setQuickFilter(value)
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

  const [form] = Form.useForm<EmployeeFormValues>()

  const handleFormSubmit = (values: EmployeeFormValues) => {
    const nextId = rowData.length > 0 ? Math.max(...rowData.map((item) => item.id)) + 1 : 1
    setLocalRows((prev) => [
      ...prev,
      {
        id: nextId,
        ...values,
      },
    ])
    message.success('New employee added successfully!')
    form.resetFields()
  }

  const antdColumns: ColumnsType<Employee> = [
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
      render: (status: Employee['status']) => {
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
        <EmployeeTable
          rowData={rowData}
          searchText={searchText}
          setSearchText={setSearchText}
          handleAddEmployee={handleAddEmployee}
          antdColumns={antdColumns}
          loading={queryResult.isLoading}
        />

        <EmployeeForm form={form} handleFormSubmit={handleFormSubmit} />

        <GridSection
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          handleSearch={handleSearch}
          handleExport={handleExport}
          searchText={searchText}
        />
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
