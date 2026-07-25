import { useState, useCallback, useMemo, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community'
import { Tag, Checkbox } from 'antd'
import type { Employee } from '../types/employee'
import CustomGroupHeader from './CustomGroupHeader'
import FiveColumnGroupHeader from './FiveColumnGroupHeader'
import './GroupedHeaderGrid.css'

interface Props {
  rowData: Employee[]
}

const GroupedHeaderGrid: React.FC<Props> = ({ rowData }) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    console.log(`[GroupedHeaderGrid] rowData loaded: ${rowData.length} rows`, rowData)
  }, [rowData])

  useEffect(() => {
    if (gridApi) {
      console.log('🚀 ~ GroupedHeaderGrid ~       gridApi.getColumn():', gridApi.getColumns())
      // console.log(
      //   '[GroupedHeaderGrid] gridApi is ready, total rows:',
      //   gridApi.getDisplayedRowCount(),
      // )
    }
  }, [gridApi])

  const handleCheckChange = useCallback((id: number, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const allChecked = rowData.length > 0 && rowData.every((r) => checkedIds.has(r.id))
  const someChecked = !allChecked && rowData.some((r) => checkedIds.has(r.id))

  const handleHeaderCheck = useCallback(
    (checked: boolean) => {
      setCheckedIds(new Set(checked ? rowData.map((r) => r.id) : []))
    },
    [rowData],
  )

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: 'Employee Data',
        headerGroupComponent: CustomGroupHeader,
        headerGroupComponentParams: {
          showCheckbox: true,
          checked: allChecked,
          indeterminate: someChecked,
          onCheckChange: handleHeaderCheck,
        },
        headerClass: 'group-header-top',
        marryChildren: true,
        children: [
          {
            headerName: '5-Column Group',
            headerGroupComponent: FiveColumnGroupHeader,
            headerGroupComponentParams: {
              showCheckbox: true,
              checked: allChecked,
              indeterminate: someChecked,
              onCheckChange: handleHeaderCheck,
            },
            headerClass: 'group-header-five',
            marryChildren: true,
            children: [
              {
                headerName: 'All Columns',
                headerGroupComponent: CustomGroupHeader,
                headerClass: 'group-header-mid',
                marryChildren: true,
                children: [
                  {
                    headerName: 'Contact Info',
                    headerGroupComponent: CustomGroupHeader,
                    headerClass: 'group-header-contact',
                    marryChildren: true,
                    children: [
                      { field: 'id', headerName: 'ID', width: 80, sortable: true, filter: true },
                      {
                        field: 'name',
                        headerName: 'Name',
                        width: 150,
                        sortable: true,
                        filter: true,
                      },
                    ],
                  },
                  {
                    headerName: 'Details',
                    headerGroupComponent: CustomGroupHeader,
                    headerGroupComponentParams: {
                      showCheckbox: true,
                      checked: allChecked,
                      indeterminate: someChecked,
                      onCheckChange: handleHeaderCheck,
                    },
                    headerClass: 'group-header-details',
                    marryChildren: true,
                    children: [
                      {
                        field: 'id',
                        headerName: 'Select',
                        width: 90,
                        sortable: false,
                        filter: false,
                        cellRenderer: (params: any) => (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                            }}
                          >
                            <Checkbox
                              checked={checkedIds.has(params.value)}
                              onChange={(e) => handleCheckChange(params.value, e.target.checked)}
                            />
                          </div>
                        ),
                      },
                      { field: 'age', headerName: 'Age', width: 100, sortable: true, filter: true },
                      {
                        field: 'department',
                        headerName: 'Department',
                        width: 150,
                        sortable: true,
                        filter: true,
                      },
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
                      {
                        field: 'status',
                        headerName: 'Status24',
                        width: 120,
                        sortable: true,
                        filter: true,
                        cellRenderer: (params: any) => {
                          const color = params.value === 'Active' ? 'green' : 'red'
                          return <Tag color={color}>{params.value}</Tag>
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    [allChecked, someChecked, handleHeaderCheck, handleCheckChange, checkedIds],
  )

  return (
    <div className="grouped-header-wrapper">
      <div
        style={{
          marginBottom: 12,
          padding: '8px 12px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6,
        }}
      >
        <strong>✅ Checked IDs:</strong>{' '}
        {checkedIds.size > 0 ? (
          [...checkedIds].sort((a, b) => a - b).join(', ')
        ) : (
          <span style={{ color: '#999' }}>none</span>
        )}
        <span style={{ marginLeft: 12, color: '#666' }}>
          ({checkedIds.size} / {rowData.length} selected)
        </span>
      </div>
      <div className="ag-theme-quartz grouped-header-grid" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
          }}
          animateRows
          onGridReady={(params) => {
            setGridApi(params.api)
            console.log('[GroupedHeaderGrid] Grid ready, api available')
          }}
        />
      </div>
    </div>
  )
}

export default GroupedHeaderGrid
