import React from 'react'
import type { IHeaderGroupParams } from 'ag-grid-community'
import { Checkbox } from 'antd'

interface FiveColumnParams extends IHeaderGroupParams {
  checked?: boolean
  indeterminate?: boolean
  onCheckChange?: (checked: boolean) => void
}

const labels = ['ID', 'Name', 'Select', 'Age', 'Department', 'Status']

const FiveColumnGroupHeader: React.FC<FiveColumnParams> = (props) => {
  const leafColumns = props.columnGroup.getLeafColumns()
  const totalWidth = leafColumns.reduce((sum, col) => sum + (col.getActualWidth() || 100), 0)

  return (
    <div style={{ display: 'flex', height: '100%', width: totalWidth }}>
      {leafColumns.map((col, idx) => {
        const w = col.getActualWidth() || 100
        return (
          <div
            key={col.getColId()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              width: w,
              minWidth: w,
              height: '100%',
              fontWeight: 600,
              fontSize: 13,
              color: '#006d75',
              borderRight: idx < leafColumns.length - 1 ? '1px solid #87e8de' : 'none',
              boxSizing: 'border-box',
              padding: '0 4px',
            }}
          >
            <Checkbox
              checked={props.checked}
              indeterminate={props.indeterminate}
              onChange={(e) => props.onCheckChange?.(e.target.checked)}
            />
            <span>{labels[idx] ?? col.getColDef().headerName ?? ''}</span>
          </div>
        )
      })}
    </div>
  )
}

export default FiveColumnGroupHeader
