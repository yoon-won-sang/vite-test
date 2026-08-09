import { useState } from 'react'
import { Menu } from 'antd'
import { MenuFoldOutlined, FullscreenOutlined, UnorderedListOutlined, BarChartOutlined } from '@ant-design/icons'
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
      key: 'grouped-header',
      icon: <UnorderedListOutlined />,
      label: '그룹 헤더',
    },
    {
      key: 'table',
      icon: <Menu />,
      label: 'AntD 테이블',
    },
    {
      key: 'form',
      icon: <Menu />,
      label: '직원 등록',
    },
    {
      key: 'grid',
      icon: <Menu />,
      label: 'ag-Grid 무한 스크롤',
    },
    {
      key: 'checkbox-grid',
      icon: <Menu />,
      label: '체크박스 선택',
    },
    {
      key: 'empty',
      icon: <UnorderedListOutlined />,
      label: '차트',
    },
    {
      key: 'brush',
      icon: <UnorderedListOutlined />,
      label: '브러시 예제',
    },
    {
      key: 'trigonometric',
      icon: <UnorderedListOutlined />,
      label: '삼각함수 차트',
    },
    {
      key: 'simple-scatter',
      icon: <UnorderedListOutlined />,
      label: '단순 산점도',
    },
    {
      key: 'example',
      icon: <UnorderedListOutlined />,
      label: '작업 중',
    },
    {
      key: 'checkbox-matrix',
      icon: <Menu />,
      label: '체크박스 매트릭스',
    },
    {
      key: 'column-handling',
      icon: <Menu />,
      label: '컬럼 처리',
    },
    {
      key: 'web-worker',
      icon: <UnorderedListOutlined />,
      label: '웹 워커',
    },
    {
      key: 'merge-example',
      icon: <UnorderedListOutlined />,
      label: '병합예제',
    },
    {
      key: 'simple-line-example',
      icon: <UnorderedListOutlined />,
      label: '동적선차트',
    },
    {
      key: 'chart-tab-example',
      icon: <UnorderedListOutlined />,
      label: '탭 안 차트',
    },
    {
      key: 'popup-bar-chart',
      icon: <BarChartOutlined />,
      label: '막대차트 팝업',
    },
    {
      key: 'string-operations',
      icon: <UnorderedListOutlined />,
      label: '문자열 연산',
    },
    {
      key: 'zustand-example',
      icon: <UnorderedListOutlined />,
      label: 'zustand 예제',
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
