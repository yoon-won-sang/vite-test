'use client';
import { useFetchJson } from './useFetchJson';
// React Grid Logic
import React, { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Tooltip, Button } from 'antd';
import ReactECharts from 'echarts-for-react';

ModuleRegistry.registerModules([AllCommunityModule]);

// Custom Cell Renderer (Display logos based on cell value)
const CompanyLogoRenderer = (params) => (
  <span
    style={{
      display: "flex",
      height: "100%",
      width: "100%",
      alignItems: "center",
    }}
  >
    {params.value && (
      <img
        alt={`${params.value} Flag`}
        src={`https://www.ag-grid.com/example-assets/space-company-logos/${params.value.toLowerCase()}.png`}
        style={{
          display: "block",
          width: "25px",
          height: "auto",
          maxHeight: "50%",
          marginRight: "12px",
          filter: "brightness(1.1)",
        }}
      />
    )}
    <p
      style={{
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <Tooltip title={params.value} placement='topLeft'>
        {params.value}
      </Tooltip>
    </p>
  </span>
);

/* Custom Cell Renderer (Display tick / cross in 'Successful' column) */
const MissionResultRenderer = (params) => (
  <span
    style={{
      display: "flex",
      justifyContent: "center",
      height: "100%",
      alignItems: "center",
    }}
  >
    {
      <img
        alt={`${params.value}`}
        src={`https://www.ag-grid.com/example-assets/icons/${params.value ? "tick-in-circle" : "cross-in-circle"}.png`}
        style={{ width: "auto", height: "auto" }}
      />
    }
  </span>
);

/* Format Date Cells */
const dateFormatter = (params) => {
  if (!params.value) return '';
  const d = new Date(params.value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
};

const rowSelection = {
  mode: "multiRow",
  headerCheckbox: false,
};

// Create new GridExample component
const App = () => {
  // Row Data: The data to be displayed.
  const { data, loading } = useFetchJson(
    "https://www.ag-grid.com/example-assets/space-mission-data.json",
  );

  // Column Definitions: Defines & controls grid columns.
  const [colDefs] = useState([
    {
      field: "mission",
      width: 150,
    },
    {
      field: "company",
      width: 130,
      cellRenderer: CompanyLogoRenderer,
    },
    {
      field: "location",
      width: 225,
      cellRenderer: (params) => (
        <Tooltip title={params.value} placement="topLeft">
          <span style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}>{params.value}</span>
        </Tooltip>
      ),
    },
    {
      field: "date",
      valueFormatter: dateFormatter,
    },
    {
      field: "price",
      width: 130,
      valueFormatter: (params) => {
        return "£" + params.value.toLocaleString();
      },
    },
    {
      field: "successful",
      width: 120,
      cellRenderer: MissionResultRenderer,
    },
    { field: "rocket" },
    {
      headerName: '판매 정보',
      headerName: '상세',
      colId: 'sales-detail',
      children: [
        { field: 'location', headerName: '위치', width: 200 },
        { field: 'rocket', headerName: '로켓', width: 200 },
      ]
    }
  ]);

  // Apply settings across all columns
  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      editable: true,
      flex: 1,
    };
  }, []);


  const options = {
    // 범례(legend) 설정
    grid: {
      left: '10%', // 차트 왼쪽 여백을 10%로 설정
      right: '10%', // 차트 오른쪽 여백을 10%로 설정
      bottom: '10%', // 차트 아래쪽 여백을 10%로 설정
      containLabel: true // 축 이름이 잘리지 않도록 그리드 영역을 확장
    },
    legend: {
      data: ['매출', '비용'],
      bottom: 0, // 범례를 하단에 배치
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '매출', // 범례에 표시될 이름
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar',
      },
      {
        name: '비용', // 범례에 표시될 이름
        data: [100, 150, 120, 60, 50, 90, 100],
        type: 'bar',
      },
    ],
  };

  // Container: Defines the grid's theme & dimensions.
  return (
    <>
      <div style={{ width: "100%", height: "500px" }}>
        <AgGridReact
          rowData={data}
          loading={loading}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          rowSelection={rowSelection}
          onSelectionChanged={(event) => console.log("Row Selected!")}
          onCellValueChanged={(event) =>
            console.log(`New Cell Value: ${event.value}`)
          }
          headerHeight={20}
        />
      </div>

      <div style={{ width: '100%', height: '400px' }}>
        <ReactECharts option={options} />
      </div>
    </>
  );
};


export default App;