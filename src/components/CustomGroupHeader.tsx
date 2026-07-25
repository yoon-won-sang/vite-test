import React from 'react'
import type { IHeaderGroupParams } from 'ag-grid-community'
import { Checkbox } from 'antd'
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons'

interface CustomHeaderParams extends IHeaderGroupParams {
  icon?: React.ReactNode
  showCheckbox?: boolean
  checked?: boolean
  indeterminate?: boolean
  onCheckChange?: (checked: boolean) => void
}

const iconMap: Record<string, React.ReactNode> = {
  contact: <UserOutlined style={{ marginRight: 6 }} />,
  details: <InfoCircleOutlined style={{ marginRight: 6 }} />,
}

const CustomGroupHeader: React.FC<CustomHeaderParams> = (props) => {
  console.log('🚀 ~ CustomGroupHeader ~ props:', props)
  const iconKey = props.columnGroup.getGroupId()
  const icon = props.icon ?? iconMap[iconKey] ?? null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 4,
      }}
    >
      {props.showCheckbox && (
        <Checkbox
          checked={props.checked}
          indeterminate={props.indeterminate}
          onChange={(e) => props.onCheckChange?.(e.target.checked)}
        />
      )}
      {icon}
      <span style={{ fontWeight: 700, fontSize: 14 }}>{props.displayName}</span>
      <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 6 }}>
        ({props.columnGroup.getLeafColumns().length} cols)
      </span>
    </div>
  )
}

export default CustomGroupHeader
