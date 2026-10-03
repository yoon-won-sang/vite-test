import { useState } from 'react'
import { Menu } from 'antd'
import { MenuFoldOutlined, FullscreenOutlined, UnorderedListOutlined, BarChartOutlined, TableOutlined, CheckSquareOutlined, SettingOutlined, FormOutlined } from '@ant-design/icons'
import type { MenuItemType } from 'antd/es/menu/interface'
import './Sidebar.css'

interface SidebarProps {
  activeKey: string
  onNavigate: (key: string) => void
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeKey, onNavigate, collapsed, onCollapse }) => {
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const menuItems: MenuItemType[] = [
    {
      key: 'group',
      label: '그리드 예제',
      type: 'group',
      children: [
        { key: 'grouped-header', label: '그룹 헤더', icon: <UnorderedListOutlined /> },
        { key: 'table', label: 'AntD 테이블', icon: <TableOutlined /> },
        { key: 'grid', label: 'ag-Grid 무한 스크롤', icon: <TableOutlined /> },
        { key: 'checkbox-grid', label: '체크박스 선택', icon: <CheckSquareOutlined /> },
        { key: 'checkbox-matrix', label: '체크박스 매트릭스', icon: <CheckSquareOutlined /> },
        { key: 'column-handling', label: '컬럼 처리', icon: <SettingOutlined /> },
        { key: 'table-diff', label: '테이블 비교', icon: <TableOutlined /> },
        { key: 'score-grid', label: '스코어-그리드 예제', icon: <TableOutlined /> },
      ],
    },
    {
      key: 'chart',
      label: '차트 예제',
      type: 'group',
      children: [
        { key: 'empty', label: '차트', icon: <BarChartOutlined /> },
        { key: 'brush', label: '브러시 예제', icon: <BarChartOutlined /> },
        { key: 'trigonometric', label: '삼각함수 차트', icon: <BarChartOutlined /> },
        { key: 'simple-scatter', label: '단순 산점도', icon: <BarChartOutlined /> },
        { key: 'simple-line-example', label: '라인차트', icon: <BarChartOutlined /> },
        { key: 'chart-tab-example', label: '탭 안 차트', icon: <BarChartOutlined /> },
        { key: 'popup-bar-chart', label: '막대차트 팝업', icon: <BarChartOutlined /> },
      ],
    },
    {
      key: 'etc',
      label: '기타/기능',
      type: 'group',
      children: [
        { key: 'form', label: '직원 등록', icon: <FormOutlined /> },
        { key: 'web-worker', label: '웹 워커', icon: <SettingOutlined /> },
        { key: 'merge-example', label: '병합예제', icon: <SettingOutlined /> },
        { key: 'string-operations', label: '문자열 연산', icon: <SettingOutlined /> },
        { key: 'zustand-example', label: 'zustand 예제', icon: <SettingOutlined /> },
        { key: 'modal-demo', label: 'zustand 모달 예제', icon: <SettingOutlined /> },
        { key: 'sso-iframe-popup', label: 'SSO iframe 팝업', icon: <SettingOutlined /> },
        { key: 'example', label: '작업 중', icon: <SettingOutlined /> },
      ],
    },
  ]

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
    </div>
  )
}

export default Sidebar
