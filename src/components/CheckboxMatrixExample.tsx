import { Card, Checkbox } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import { useMemo, useRef, useState } from 'react'
import type { ColDef } from 'ag-grid-community'

const TOTAL_ROWS = 10
const TOTAL_COLUMNS = 10

// Store header checkbox states
const headerCheckboxStates: Record<string, boolean> = {}
// Store header component instances for force updates
const headerComponentInstances: Record<string, any> = {}

// Custom header component with antd Checkbox
const CheckboxHeader = (props: any) => {
  const columnField = props.column.getColId()
  const [, forceUpdate] = useState(0)

  // Store this component instance
  headerComponentInstances[columnField] = { props, forceUpdate }

  // Initialize header checkbox state if not already set
  if (!(columnField in headerCheckboxStates)) {
    headerCheckboxStates[columnField] = false
  }

  const checked = headerCheckboxStates[columnField] || false

  const handleCheckboxChange = (e: any) => {
    const newValue = e.target.checked
    headerCheckboxStates[columnField] = newValue

    // Update all cells in this column or row
    if (props.api) {
      props.api.forEachNode((node: any) => {
        // For row label column, just set the value directly
        if (columnField === 'rowLabel') {
          node.setDataValue(columnField, newValue)

          // When rowLabel is unchecked, uncheck all cells in this row
          if (!newValue) {
            const allColumns = props.api.getColumns()
            if (allColumns) {
              allColumns.forEach((col: any) => {
                const colId = col.getColId()
                if (colId !== 'rowLabel') {
                  node.setDataValue(colId, false)
                }
              })
            }
          } else {
            // When rowLabel is checked, check cells where column header is checked
            const allColumns = props.api.getColumns()
            if (allColumns) {
              allColumns.forEach((col: any) => {
                const colId = col.getColId()
                if (colId !== 'rowLabel') {
                  const colHeaderChecked = headerCheckboxStates[colId] || false
                  node.setDataValue(colId, colHeaderChecked)
                }
              })
            }
          }
        } else {
          // For regular columns, only check cells where rowLabel is also checked
          const rowLabelChecked = node.data.rowLabel
          node.setDataValue(columnField, rowLabelChecked && newValue)
        }
      })
    }

    // Force re-render
    forceUpdate((prev: number) => prev + 1)
  }

  return <Checkbox checked={checked} onChange={handleCheckboxChange} />
}

// Row label cell renderer to handle row label checkbox clicks
const RowLabelRenderer = (props: any) => {
  const handleCheckboxChange = (e: any) => {
    const newValue = e.target.checked

    // Update the row label
    if (props.node && props.api) {
      props.node.setDataValue('rowLabel', newValue)

      // After updating rowLabel, check all columns in this row
      // where the column header is checked
      const allColumns = props.api.getColumns()

      if (allColumns) {
        allColumns.forEach((col: any) => {
          const colId = col.getColId()
          if (colId !== 'rowLabel') {
            // Get the column header checkbox state from the shared state
            const colHeaderChecked = headerCheckboxStates[colId] || false
            // If column header is checked, check this cell
            const shouldCheck = colHeaderChecked && newValue
            props.node.setDataValue(colId, shouldCheck)
          }
        })
      }
    }
  }

  return <Checkbox checked={props.value || false} onChange={handleCheckboxChange} />
}

// Custom cell renderer for regular checkbox cells
const CheckboxCellRenderer = (props: any) => {
  const handleCheckboxChange = (e: any) => {
    const newValue = e.target.checked
    const colId = props.column.getColId()

    // Update the cell value
    if (props.node && props.api) {
      props.node.setDataValue(colId, newValue)

      // Check if all cells in this column are deselected
      let allColumnCellsDeselected = true
      props.api.forEachNode((node: any) => {
        if (node.data[colId]) {
          allColumnCellsDeselected = false
        }
      })

      // Only deselect column header if all cells in column are deselected
      if (allColumnCellsDeselected) {
        headerCheckboxStates[colId] = false
        const headerInstance = headerComponentInstances[colId]
        if (headerInstance) {
          headerInstance.forceUpdate((prev: number) => prev + 1)
        }
      } else if (newValue) {
        // If checking a cell, also check the column header
        headerCheckboxStates[colId] = true
        const headerInstance = headerComponentInstances[colId]
        if (headerInstance) {
          headerInstance.forceUpdate((prev: number) => prev + 1)
        }
      }

      // Check if all cells in this row are deselected
      let allRowCellsDeselected = true
      const allColumns = props.api.getColumns()
      if (allColumns) {
        allColumns.forEach((col: any) => {
          const colIdCheck = col.getColId()
          if (colIdCheck !== 'rowLabel' && props.node.data[colIdCheck]) {
            allRowCellsDeselected = false
          }
        })
      }

      // Only deselect rowLabel if all cells in row are deselected
      if (allRowCellsDeselected) {
        props.node.setDataValue('rowLabel', false)
      } else if (newValue) {
        // If checking a cell, also check the rowLabel
        props.node.setDataValue('rowLabel', true)
      }
    }
  }

  return <Checkbox checked={props.value || false} onChange={handleCheckboxChange} />
}

function CheckboxMatrixExample() {
  const [selectAllColumns, setSelectAllColumns] = useState(false)
  const [selectAllRows, setSelectAllRows] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const gridRef = useRef<any>(null)

  const handleSelectAllColumns = (checked: boolean) => {
    setSelectAllColumns(checked)

    // Update all column headers and cells
    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api

      // Check all column headers (including rowLabel)
      Object.keys(headerCheckboxStates).forEach((key) => {
        headerCheckboxStates[key] = checked
      })

      // Update all cells in all columns
      api.forEachNode((node: any) => {
        const allColumns = api.getColumns()
        if (allColumns) {
          allColumns.forEach((col: any) => {
            const colId = col.getColId()
            if (colId !== 'rowLabel') {
              const rowLabelChecked = node.data.rowLabel
              node.setDataValue(colId, rowLabelChecked && checked)
            }
          })
        }
      })

      // Force all header components to re-render using stored instances
      Object.keys(headerCheckboxStates).forEach((key) => {
        const headerInstance = headerComponentInstances[key]
        if (headerInstance && headerInstance.forceUpdate) {
          headerInstance.forceUpdate((prev: number) => prev + 1)
        }
      })

      // Refresh the grid to update cell renderers
      api.refreshCells()
    }
  }

  const handleSelectAllRows = (checked: boolean) => {
    setSelectAllRows(checked)

    // Update all row labels and cells
    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api

      // Check all row labels
      api.forEachNode((node: any) => {
        node.setDataValue('rowLabel', checked)

        // When rowLabel is checked, check cells where column header is checked
        if (checked) {
          const allColumns = api.getColumns()
          if (allColumns) {
            allColumns.forEach((col: any) => {
              const colId = col.getColId()
              if (colId !== 'rowLabel') {
                const colHeaderChecked = headerCheckboxStates[colId] || false
                node.setDataValue(colId, colHeaderChecked)
              }
            })
          }
        } else {
          // When rowLabel is unchecked, uncheck all cells in this row
          const allColumns = api.getColumns()
          if (allColumns) {
            allColumns.forEach((col: any) => {
              const colId = col.getColId()
              if (colId !== 'rowLabel') {
                node.setDataValue(colId, false)
              }
            })
          }
        }
      })

      // Refresh the grid to update cell renderers
      api.refreshCells()
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setSelectAllColumns(checked)
    setSelectAllRows(checked)

    // Update all column headers and cells
    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api

      // Check all column headers
      Object.keys(headerCheckboxStates).forEach((key) => {
        headerCheckboxStates[key] = checked
      })

      // Update all cells
      api.forEachNode((node: any) => {
        // Update row label
        node.setDataValue('rowLabel', checked)

        // Update all cells
        const allColumns = api.getColumns()
        if (allColumns) {
          allColumns.forEach((col: any) => {
            const colId = col.getColId()
            if (colId !== 'rowLabel') {
              node.setDataValue(colId, checked)
            }
          })
        }
      })

      // Force all header components to re-render using stored instances
      Object.keys(headerCheckboxStates).forEach((key) => {
        const headerInstance = headerComponentInstances[key]
        if (headerInstance && headerInstance.forceUpdate) {
          headerInstance.forceUpdate((prev: number) => prev + 1)
        }
      })

      // Refresh the grid to update cell renderers
      api.refreshCells()
    }
  }

  const handleGridReady = (params: any) => {
    gridRef.current = { api: params.api }
  }

  const columnDefs = useMemo<ColDef[]>(() => {
    const checkboxCols: ColDef[] = Array.from({ length: TOTAL_COLUMNS }, (_, index) => ({
      field: `col_${index + 1}`,
      headerName: `box ${index + 1}`,
      width: 80,
      editable: true,
      cellRenderer: CheckboxCellRenderer,
      cellEditor: 'agCheckboxCellEditor',
      headerComponent: CheckboxHeader,
      headerComponentParams: {
        suppressKeyboardEvent: (_params: any) => {
          // Allow keyboard navigation in the header
          return false
        },
      },
    }))

    return [
      {
        field: 'rowLabel',
        width: 110,
        pinned: 'left',
        suppressMovable: true,
        cellRenderer: RowLabelRenderer,
        cellEditor: 'agCheckboxCellEditor',
        headerComponent: CheckboxHeader,
        headerComponentParams: {
          suppressKeyboardEvent: (_params: any) => {
            // Allow keyboard navigation in the header
            return false
          },
        },
      },
      ...checkboxCols,
    ]
  }, [])

  const rowData = useMemo(
    () =>
      Array.from({ length: TOTAL_ROWS }, () => {
        const row: Record<string, boolean> = {
          rowLabel: false,
        }

        for (let colIndex = 0; colIndex < TOTAL_COLUMNS; colIndex += 1) {
          row[`col_${colIndex + 1}`] = false
        }

        return row
      }),
    [],
  )
  console.log('rowData', rowData)
  return (
    <Card title="ag-Grid Checkbox Matrix Example" className="card-section">
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Checkbox
          checked={selectAllColumns}
          onChange={(e) => handleSelectAllColumns(e.target.checked)}
        >
          Select All Column Headers
        </Checkbox>
        <Checkbox checked={selectAllRows} onChange={(e) => handleSelectAllRows(e.target.checked)}>
          Select All Row Headers
        </Checkbox>
        <Checkbox checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)}>
          Select All
        </Checkbox>
      </div>
      <div className="ag-theme-quartz" style={{ width: '100%', height: '500px' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: false,
            filter: false,
            resizable: false,
            editable: true,
          }}
          // domLayout="autoHeight"
          // rowSelection="multiple"
          rowBuffer={0}
          suppressAnimationFrame={true}
          headerHeight={60}
          onGridReady={handleGridReady}
        />
      </div>
    </Card>
  )
}

export default CheckboxMatrixExample
