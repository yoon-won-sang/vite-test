import { useEffect, useState } from 'react'
import axios from 'axios'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { Form, Tabs, message, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ColumnsType } from 'antd/es/table'
import type { GridApi } from 'ag-grid-community'
import {
  TableOutlined,
  FormOutlined,
  BgColorsOutlined,
  AppstoreAddOutlined,
  CheckSquareOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import EmployeeTable from './components/EmployeeTable'
import EmployeeForm from './components/EmployeeForm'
import InfiniteGridSection from './components/InfiniteGridSection'
import CheckboxGridSection from './components/CheckboxGridSection'
import CheckboxMatrixExample from './components/CheckboxMatrixExample'
import ColumnHandlingSection from './components/ColumnHandlingSection'
import Charts from './components/Charts'
import BrushExample from './components/BrushExample'
import GroupedHeaderGrid from './components/GroupedHeaderGrid'
import Working from './components/Working.tsx'
import TrigonometricChart from './components/TrigonometricChart'
import SimpleScatterChart from './components/SimpleScatterChart'
import WebWorkerExample from './components/WebWorkerExample'
import MergeExample from './components/MergeExample'
import SimpleLineChart from './components/SimpleLineChart'
import type { Employee, EmployeeFormValues } from './types/employee'
import './App.css'
import Sidebar from './components/Sidebar'

function App() {
  const [collapsed, setCollapsed] = useState(false)
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
      key: 'grouped-header',
      label: '그룹 헤더',
      icon: <AppstoreAddOutlined />,
      children: <GroupedHeaderGrid rowData={rowData} />,
    },
    {
      key: 'table',
      label: 'AntD 테이블',
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
      label: '직원 등록',
      icon: <FormOutlined />,
      children: <EmployeeForm form={form} handleFormSubmit={handleFormSubmit} />,
    },
    {
      key: 'grid',
      label: 'ag-Grid 무한 스크롤',
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
      key: 'checkbox-grid',
      label: '체크박스 선택',
      icon: <CheckSquareOutlined />,
      children: <CheckboxGridSection rowData={rowData} />,
    },
    {
      key: 'empty',
      label: '차트',
      icon: <AppstoreAddOutlined />,
      children: <Charts />,
    },
    {
      key: 'brush',
      label: '브러시 예제',
      icon: <AppstoreAddOutlined />,
      children: <BrushExample />,
    },
    {
      key: 'trigonometric',
      label: '삼각함수 차트',
      icon: <AppstoreAddOutlined />,
      children: <TrigonometricChart />,
    },
    {
      key: 'simple-scatter',
      label: '단순 산점도',
      icon: <AppstoreAddOutlined />,
      children: <SimpleScatterChart />,
    },
    {
      key: 'example',
      label: '작업 중',
      icon: <AppstoreAddOutlined />,
      children: <Working rowData={rowData} />,
    },
    {
      key: 'checkbox-matrix',
      label: '체크박스 매트릭스',
      icon: <CheckSquareOutlined />,
      children: <CheckboxMatrixExample />,
    },
    {
      key: 'column-handling',
      label: '컬럼 처리',
      icon: <SettingOutlined />,
      children: <ColumnHandlingSection rowData={rowData} />,
    },
    {
      key: 'web-worker',
      label: '웹 워커',
      icon: <AppstoreAddOutlined />,
      children: <WebWorkerExample />,
    },
    {
      key: 'merge-example',
      label: '병합예제',
      icon: <AppstoreAddOutlined />,
      children: <MergeExample />,
    },
    {
      key: 'simple-line-example',
      label: '라인차트',
      icon: <AppstoreAddOutlined />,
      children: <SimpleLineChart />,
    },

  ]

  const [activeTab, setActiveTab] = useState('grouped-header')

  const handleNavigate = (key: string) => {
    setActiveTab(key)
  }
  return (
    <div className="app-container">
      <div className="layout-wrapper">
        <Sidebar
          activeKey={activeTab}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />

        <div className={`main-content ${collapsed ? 'expanded-content' : ''}`}>
          <div className="header">
            <h1>🚀 Vite + React + ag-Grid + Ant Design</h1>
            <p>Employee Management System Example</p>
          </div>

          <div className="content">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              defaultActiveKey="grouped-header"
              items={tabs}
            />
          </div>

          <footer className="footer">
            <p>
              Built with <strong>Vite</strong> • <strong>React</strong> • <strong>ag-Grid</strong> •{' '}
              <strong>Ant Design</strong>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App
