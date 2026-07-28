import { useState, useMemo, useCallback, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type {
  ColDef,
  ColGroupDef,
  GridReadyEvent,
  ICellRendererParams,
  GridApi,
} from 'ag-grid-community'
import { Checkbox, Tag, Button, Space, message } from 'antd'
import {
  MergeCellsOutlined,
  CheckSquareOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'

interface MergeData {
  id: number
  department: string
  team: string
  name: string
  role: string
  status: string
  salary: number
  checked: boolean
}

const generateMergeData = (): MergeData[] => {
  const departments = [
    { dept: 'Engineering', teams: ['Frontend', 'Backend', 'DevOps', 'QA'] },
    { dept: 'Marketing', teams: ['Digital', 'Content', 'Brand', 'Research'] },
    { dept: 'Sales', teams: ['Domestic', 'Overseas', 'Partnership'] },
    { dept: 'Finance', teams: ['Accounting', 'Audit', 'Planning'] },
    { dept: 'HR', teams: ['Recruiting', 'Training', 'Benefits'] },
  ]

  const names = [
    '김철수',
    '이영희',
    '박민수',
    '최지현',
    '정다은',
    '강호준',
    '윤소희',
    '송민기',
    '임지영',
    '한상우',
    '오세진',
    '서미영',
    '권태현',
    '황보람',
    '안재민',
    '문지혜',
    '양준혁',
    '배수진',
    '류경수',
    '조은정',
  ]

  const roles = ['Manager', 'Lead', 'Senior', 'Junior', 'Intern']
  const statuses: MergeData['status'][] = ['Active', 'Inactive', 'On Leave']

  const result: MergeData[] = []
  let id = 1

  departments.forEach(({ dept, teams }) => {
    const memberCount = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < memberCount; i++) {
      const team = teams[Math.floor(Math.random() * teams.length)]
      const nameIdx = (id - 1) % names.length
      result.push({
        id,
        department: dept,
        team,
        name: names[nameIdx],
        role: roles[Math.floor(Math.random() * roles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        salary: 3000 + Math.floor(Math.random() * 7000),
        checked: false,
      })
      id++
    }
  })

  return result
}

const statusColorMap: Record<string, string> = {
  Active: 'green',
  Inactive: 'red',
  'On Leave': 'orange',
}

const departmentRowSpan = (params: any) => {
  const data = params.data
  if (!data) return 1
  const model = params.api?.getModel()
  if (!model) return 1
  const allRows = model.getRowCount()
  if (allRows === 0) return 1

  const currentRowIndex = params.rowIndex
  const thisDept = data.department

  let span = 1
  for (let i = currentRowIndex + 1; i < allRows; i++) {
    const rowNode = model.getRow(i)
    if (rowNode?.data?.department === thisDept) {
      span++
    } else {
      break
    }
  }

  if (currentRowIndex > 0) {
    const prevNode = model.getRow(currentRowIndex - 1)
    if (prevNode?.data?.department === thisDept) {
      return 0
    }
  }

  return span
}

const teamRowSpan = (params: any) => {
  const data = params.data
  if (!data) return 1
  const model = params.api?.getModel()
  if (!model) return 1
  const allRows = model.getRowCount()
  if (allRows === 0) return 1

  const thisTeam = data.team
  const thisDept = data.department
  const currentRowIndex = params.rowIndex

  let span = 1
  for (let i = currentRowIndex + 1; i < allRows; i++) {
    const rowNode = model.getRow(i)
    if (rowNode?.data?.team === thisTeam && rowNode?.data?.department === thisDept) {
      span++
    } else {
      break
    }
  }

  if (currentRowIndex > 0) {
    const prevNode = model.getRow(currentRowIndex - 1)
    if (prevNode?.data?.team === thisTeam && prevNode?.data?.department === thisDept) {
      return 0
    }
  }

  return span
}

const MergeExample = () => {
  const gridApiRef = useRef<GridApi | null>(null)
  const [rowData] = useState<MergeData[]>(generateMergeData)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())

  const allChecked = rowData.length > 0 && rowData.every((r) => checkedIds.has(r.id))
  const someChecked = !allChecked && rowData.some((r) => checkedIds.has(r.id))

  const handleRowCheckChange = useCallback((id: number, checked: boolean) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleHeaderCheck = useCallback(
    (checked: boolean) => {
      setCheckedIds(new Set(checked ? rowData.map((r) => r.id) : []))
    },
    [rowData],
  )

  const clearSelection = useCallback(() => {
    setCheckedIds(new Set())
    message.info('선택이 초기화되었습니다.')
  }, [])

  const showSelection = useCallback(() => {
    if (checkedIds.size === 0) {
      message.warning('선택된 행이 없습니다.')
      return
    }
    const selected = rowData.filter((r) => checkedIds.has(r.id))
    message.success(`선택된 직원: ${selected.length}명 (${selected.map((r) => r.name).join(', ')})`)
  }, [checkedIds, rowData])

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(
    () => [
      {
        headerName: '병합 그룹',
        groupId: 'mergeGroup',
        headerGroupComponent: (props: any) => {
          console.log('🚀 병합 그룹 groupId:', props.columnGroup.getGroupId())
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 6,
              }}
            >
              <ApartmentOutlined style={{ color: '#1890ff', fontSize: 15 }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>병합 컬럼</span>
            </div>
          )
        },
        headerClass: 'group-root-header',
        marryChildren: true,
        children: [
          {
            headerName: '',
            field: 'checked',
            width: 54,
            sortable: false,
            filter: false,
            resizable: false,
            headerComponent: () => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Checkbox
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={(e) => handleHeaderCheck(e.target.checked)}
                />
              </div>
            ),
            headerClass: 'checkbox-header',
            cellRenderer: (params: ICellRendererParams<MergeData>) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Checkbox
                  checked={checkedIds.has(params.data?.id ?? 0)}
                  onChange={(e) => handleRowCheckChange(params.data?.id ?? 0, e.target.checked)}
                />
              </div>
            ),
            pinned: 'left',
            cellClass: 'checkbox-cell',
          },
          {
            headerName: '조직 정보',
            groupId: 'orgGroup',
            headerGroupComponent: (props: any) => {
              console.log(
                '🚀 조직 정보 groupId:',
                props.columnGroup.getGroupId(),
                '| leaf cols:',
                props.columnGroup.getLeafColumns().length,
              )
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 6,
                  }}
                >
                  <TeamOutlined style={{ color: '#722ed1', fontSize: 15 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>조직</span>
                </div>
              )
            },
            headerClass: 'group-org-header',
            marryChildren: true,
            children: [
              {
                headerName: '부서',
                field: 'department',
                width: 130,
                rowSpan: departmentRowSpan,
                headerClass: 'department-header',
                cellClass: 'merge-cell department-cell',
                pinned: 'left',
              },
              {
                headerName: '팀',
                field: 'team',
                width: 110,
                rowSpan: teamRowSpan,
                headerClass: 'team-header',
                cellClass: 'merge-cell team-cell',
              },
            ],
          },
          {
            headerName: '이름',
            field: 'name',
            width: 100,
          },
          {
            headerName: '직급',
            field: 'role',
            width: 90,
          },
          {
            headerName: '급여',
            field: 'salary',
            width: 110,
            cellClass: 'salary-cell',
            valueFormatter: (params) => `${params.value?.toLocaleString()}만원`,
          },
          {
            headerName: '상태',
            field: 'status',
            width: 110,
            cellRenderer: (params: ICellRendererParams<MergeData>) => (
              <Tag color={statusColorMap[params.value ?? ''] || 'default'}>{params.value}</Tag>
            ),
          },
        ],
      },
    ],
    [allChecked, someChecked, handleHeaderCheck, handleRowCheckChange, checkedIds],
  )

  const onGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api
  }, [])

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
    }),
    [],
  )

  const headerHeight = 52

  return (
    <div className="card-section">
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MergeCellsOutlined />
          병합 예제 (Row Span + Group Header)
        </h2>
        <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>
          <InfoCircleOutlined style={{ marginRight: 4 }} />
          부서와 팀 컬럼이 병합되어 표시됩니다. 그룹 헤더 구조로 컬럼이 분류되어 있습니다.
        </p>
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: '8px 12px',
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <CheckSquareOutlined style={{ color: '#52c41a' }} />
          <strong>선택됨:</strong>
          {checkedIds.size > 0 ? (
            <span>
              총 <strong>{checkedIds.size}</strong>명 / {rowData.length}명
            </span>
          ) : (
            <span style={{ color: '#999' }}>없음</span>
          )}
        </Space>
        <Space>
          <Button size="small" onClick={showSelection}>
            선택 확인
          </Button>
          <Button size="small" onClick={clearSelection}>
            선택 해제
          </Button>
        </Space>
      </div>

      <div className="ag-theme-quartz" style={{ height: 520, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          animateRows
          suppressRowTransform
          suppressColumnVirtualisation
          headerHeight={headerHeight}
        />
      </div>

      <style>{`
        /* ===== 그룹 헤더 공통 ===== */
        .ag-theme-quartz .ag-header {
          background: linear-gradient(180deg, #f0f5ff 0%, #e6f7ff 50%, #f0f5ff 100%) !important;
          border-bottom: 2px solid #d6e4ff !important;
        }
        .ag-theme-quartz .ag-header-group-cell {
          font-weight: 700 !important;
          border-right: 1px solid #e8e8e8 !important;
        }
        .ag-theme-quartz .ag-header-cell {
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #333 !important;
          border-right: 1px solid #e8e8e8 !important;
        }
        .ag-theme-quartz .ag-header-cell:last-child {
          border-right: none !important;
        }
        .ag-theme-quartz .ag-header-group-cell-label {
          justify-content: center !important;
        }
        .ag-theme-quartz .ag-header-cell-label {
          justify-content: center !important;
        }

        /* ===== 최상위 그룹 헤더 ===== */
        .group-root-header {
          background: linear-gradient(180deg, #e6f7ff 0%, #bae7ff 100%) !important;
          border-bottom: 2px solid #91d5ff !important;
        }

        /* ===== 조직 정보 그룹 헤더 ===== */
        .group-org-header {
          background: linear-gradient(180deg, #f9f0ff 0%, #efdbff 100%) !important;
          border-bottom: 2px solid #d3adf7 !important;
        }

        /* ===== 부서 헤더 ===== */
        .department-header {
          background: linear-gradient(180deg, #f0f5ff 0%, #d6e4ff 100%) !important;
          border-left: 3px solid #597ef7 !important;
        }
        .department-header .ag-header-cell-label::before {
          content: '📁';
          margin-right: 6px;
          font-size: 13px;
        }

        /* ===== 팀 헤더 ===== */
        .team-header {
          background: linear-gradient(180deg, #f9f0ff 0%, #efdbff 100%) !important;
          border-left: 3px solid #b37feb !important;
        }
        .team-header .ag-header-cell-label::before {
          content: '👥';
          margin-right: 6px;
          font-size: 13px;
        }

        /* ===== 체크박스 헤더 ===== */
        .checkbox-header {
          background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%) !important;
        }

        /* ===== 병합 셀 스타일 ===== */
        .department-cell {
          background-color: #f0f5ff !important;
          font-weight: 700 !important;
          color: #1a237e !important;
          border-bottom: none !important;
          font-size: 14px !important;
          border-left: 3px solid #597ef7 !important;
        }
        .team-cell {
          background-color: #f9f0ff !important;
          font-weight: 600 !important;
          color: #4a148c !important;
          border-bottom: none !important;
          border-left: 3px solid #b37feb !important;
        }
        .checkbox-cell {
          border-right: 1px solid #e8e8e8 !important;
        }
        .checkbox-cell .ag-cell-value {
          width: 100%;
        }
        .salary-cell .ag-cell-value {
          font-family: 'Courier New', monospace;
          text-align: right;
          font-weight: 500;
        }
        .ag-theme-quartz .ag-row {
          border-bottom: 1px solid #e8e8e8;
        }
        .ag-theme-quartz .ag-row:hover {
          background-color: #fafafa !important;
        }
        .ag-theme-quartz .ag-header-cell-text {
          font-size: 13px !important;
        }
      `}</style>
    </div>
  )
}

export default MergeExample
