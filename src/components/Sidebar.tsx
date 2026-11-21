import { useState } from 'react'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { MenuFoldOutlined, FullscreenOutlined, BarChartOutlined, TableOutlined, SettingOutlined, FormOutlined, BgColorsOutlined } from '@ant-design/icons'
import './Sidebar.css'

interface SidebarProps {
  activeKey: string
  onNavigate: (key: string) => void
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeKey, onNavigate, collapsed, onCollapse }) => {
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const fileLabelMap: Record<string, string> = {
    'grouped-header': 'GroupedHeaderGrid.tsx',
    'table': 'EmployeeTable.tsx',
    'grid': 'InfiniteGridSection.tsx',
    'checkbox-grid': 'CheckboxGridSection.tsx',
    'checkbox-matrix': 'CheckboxMatrixExample.tsx',
    'column-handling': 'ColumnHandlingSection.tsx',
    'table-diff': 'TableDiff.tsx',
    'score-grid': 'ScoreGridExample.tsx',
    'example': 'BrushExample.tsx',
    'empty': 'Charts.tsx',
    'brush': 'BrushExample.tsx',
    'trigonometric': 'TrigonometricChart.tsx',
    'simple-scatter': 'SimpleScatterChart.tsx',
    'simple-line-example': 'SimpleLineChart.tsx',
    'chart-tab-example': 'ChartTabExample.tsx',
    'popup-bar-chart': 'PopupBarChart.tsx',
    'form': 'EmployeeForm.tsx',
    'web-worker': 'WebWorkerExample.tsx',
    'merge-example': 'MergeExample.tsx',
    'string-operations': 'StringOperations.tsx',
    'zustand-example': 'ZustandExample.tsx',
    'modal-demo': 'ZustandModalDemo.tsx',
    'sso-iframe-popup': 'SsoIframePopup.tsx',
    'color-select': 'ColorSelectExample.tsx',
    'legend-click': 'LegendClickChart.tsx',
  }

  const getMenuItem = (key: string, label: string, icon: React.ReactNode): NonNullable<MenuProps['items']>[number] => ({
    key,
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginLeft: '8px' }}>{fileLabelMap[key]}</span>
      </div>
    ),
    icon,
  })

  const menuItems: MenuProps['items'] = [
    {
      key: 'group',
      label: '그리드 예제',
      type: 'group',
      children: [
        getMenuItem('grouped-header', '그룹 헤더', <TableOutlined />),
        getMenuItem('table', 'AntD 테이블', <TableOutlined />),
        getMenuItem('grid', 'ag-Grid 무한 스크롤', <TableOutlined />),
        getMenuItem('checkbox-grid', '체크박스 선택', <TableOutlined />),
        getMenuItem('checkbox-matrix', '체크박스 매트릭스', <TableOutlined />),
        getMenuItem('column-handling', '컬럼 처리', <TableOutlined />),
        getMenuItem('table-diff', '테이블 비교', <TableOutlined />),
        getMenuItem('score-grid', '스코어-그리드 예제', <TableOutlined />),
        getMenuItem('example', 'ag-Grid Cell CheckBox', <TableOutlined />),
      ],
    },
    {
      key: 'chart',
      label: '차트 예제',
      type: 'group',
      children: [
        getMenuItem('empty', '차트', <BarChartOutlined />),
        getMenuItem('brush', '브러시 예제', <BarChartOutlined />),
        getMenuItem('trigonometric', '삼각함수 차트', <BarChartOutlined />),
        getMenuItem('simple-scatter', '단순 산점도', <BarChartOutlined />),
        getMenuItem('simple-line-example', '라인차트', <BarChartOutlined />),
        getMenuItem('chart-tab-example', '탭 안 차트', <BarChartOutlined />),
        getMenuItem('popup-bar-chart', '막대차트 팝업', <BarChartOutlined />),
        getMenuItem('legend-click', '레전드 클릭', <BarChartOutlined />),
      ],
    },
    {
      key: 'etc',
      label: '기타/기능',
      type: 'group',
      children: [
        getMenuItem('form', '직원 등록', <FormOutlined />),
        getMenuItem('web-worker', '웹 워커', <SettingOutlined />),
        getMenuItem('merge-example', '병합예제', <SettingOutlined />),
        getMenuItem('string-operations', '문자열 연산', <SettingOutlined />),
        getMenuItem('zustand-example', 'zustand 예제', <SettingOutlined />),
        getMenuItem('modal-demo', 'zustand 모달 예제', <SettingOutlined />),
        getMenuItem('sso-iframe-popup', 'SSO iframe 팝업', <SettingOutlined />),
        getMenuItem('color-select', '컬러 셀렉트', <BgColorsOutlined />),
      ],
    },
  ]

  const currentFileName = fileLabelMap[activeKey] || ''

  const toggleCollapse = () => {
    onCollapse(!collapsed)
  }

  const handleMenuClick = (key: string) => {
    onNavigate(key)
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span className="logo">🚀</span>
          {!collapsed && <span>React + ag-Grid</span>}
        </div>
        <button
          className="collapse-button"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <FullscreenOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        theme="light"
      />

      {!collapsed && currentFileName && (
        <div className="sidebar-current-file">
          <strong>Current File:</strong> {currentFileName}
        </div>
      )}
    </div>
  )
}

export default Sidebar
