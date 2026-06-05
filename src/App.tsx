import { useEffect, useState } from 'react'
import axios from 'axios'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { Form, Tag, Tabs, message, Button } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { GridApi } from 'ag-grid-community'
import {
  TableOutlined,
  FormOutlined,
  BgColorsOutlined,
  AppstoreAddOutlined,
  LogoutOutlined,
  FileExcelOutlined,
} from '@ant-design/icons'
import EmployeeTable from './components/EmployeeTable'
import EmployeeForm from './components/EmployeeForm'
import InfiniteGridSection from './components/InfiniteGridSection'
import Charts from './components/Charts'
import LoginForm from './components/LoginForm'
import type { Employee, EmployeeFormValues } from './types/employee'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ username: string } | null>(null)
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
    enabled: isLoggedIn,
  })

  const fetchedRows = queryResult.data ?? []
  const rowData = [...fetchedRows, ...localRows]

  useEffect(() => {
    if (queryResult.isError) {
      message.error('Failed to load employee data from jsonplaceholder.')
    }
  }, [queryResult.isError])

  const handleLogin = (values: { username: string }) => {
    setIsLoggedIn(true)
    setUser({ username: values.username })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    message.info('Logged out successfully')
  }

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

  const handleSearch = (value: string) => {
    setSearchText(value)
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

  const handleExcelExport = () => {
    if (gridApi) {
      // AG Grid Enterprise가 활성화된 경우 gridApi.exportDataAsExcel()을 사용할 수 있습니다.
      // 현재는 Community 버전이므로 엑셀에서 바로 호환되는 CSV 포맷으로 내보내기를 구현합니다.
      const params = {
        fileName: `employees_export_${new Date().getTime()}.csv`,
        columnSeparator: ',',
      }
      gridApi.exportDataAsCsv(params)
      message.success('Grid data exported for Excel!')
    } else if (rowData.length > 0) {
      // Grid가 없는 탭(예: AntD Table)에서도 동작하도록 기본 rowData를 기반으로 내보내기를 시도합니다.
      const headers = ['ID', 'Name', 'Age', 'Department', 'Status']
      const csv = [
        headers.join(','),
        ...rowData.map((r) => `${r.id},"${r.name}",${r.age},"${r.department}","${r.status}"`),
      ].join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `employees_table_${new Date().getTime()}.csv`
      link.click()
      message.success('Table data exported!')
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

  const tabs = [
    {
      key: 'table',
      label: 'AntD Table',
      icon: <TableOutlined />,
      children: (
        <EmployeeTable
          rowData={rowData}
          searchText={searchText}
          setSearchText={setSearchText}
          handleAddEmployee={handleAddEmployee}
          antdColumns={antdColumns}
          loading={queryResult.isLoading}
          handleExcelExport={handleExcelExport}
        />
      ),
    },
    {
      key: 'form',
      label: 'Employee Form',
      icon: <FormOutlined />,
      children: <EmployeeForm form={form} handleFormSubmit={handleFormSubmit} />,
    },
    {
      key: 'grid',
      label: 'ag-Grid Infinite Scroll',
      icon: <BgColorsOutlined />,
      children: (
        <InfiniteGridSection
          columnDefs={columnDefs}
          handleSearch={handleSearch}
          handleExport={handleExport}
          handleExcelExport={handleExcelExport}
          onGridReady={(api) => setGridApi(api)}
          searchText={searchText}
        />
      ),
    },
    {
      key: 'empty',
      label: 'Charts',
      icon: <AppstoreAddOutlined />,
      children: <Charts />,
    },
  ]

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="app-container">
      <Button className="logout-btn" icon={<LogoutOutlined />} onClick={handleLogout} danger>
        Logout
      </Button>
      <div className="header">
        <h1>🚀 Vite + React + ag-Grid + Ant Design</h1>
        <p>Welcome, {user?.username}! Employee Management System Example</p>
      </div>

      <div className="content">
        <Tabs defaultActiveKey="table" items={tabs} />
      </div>

      <footer className="footer">
        <p>
          Built with <strong>Vite</strong> • <strong>React</strong> • <strong>ag-Grid</strong> •{' '}
          <strong>Ant Design</strong>
        </p>
      </footer>
    </div>
  )
}

export default App
