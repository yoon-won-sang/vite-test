// @ts-nocheck
"use client";
import { useFetchJson } from "./useFetchJson";
import { useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import _ from "lodash";
import ReactECharts from "echarts-for-react";
import React from "react";
import { Tooltip } from "antd";

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
      <Tokltip title={params.value} placement="topLeft">
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
  if (!params.value) return "";
  const d = new Date(params.value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
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
    1,
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
      // cellEditor: 'agSelectCellEditor',
      // cellEditorParams: {
      //   values: ['SpaceX', 'NASA', 'Blue Origin', 'Virgin Galactic', 'Boeing', 'Lockheed Martin']
      // },
      cellEditor: "agNumberCellEditor", //valueParser와 함께 숫자형 에디터 사용
      cellEditorParams: { decimal: 2, min: 0, max: 100, step: 0.01 },
      // cellRenderer: CompanyLogoRenderer,
      headerTooltip: "회사",
      cellStyle: (params) => {
        if (params.value === "SpaceX" && params.node.isSelected()) {
          return { backgroundColor: "#ffcccc" }; // Light red for SpaceX
        } else {
          //console.log("params::",params.node.isSelected());
          return { backgroundColor: null }; // Default style for other companies
        }
      },
      valueParser: (params) => Number(params.newValue),
      pinned: "left",
      // spanRows: true,
    },
    {
      field: "location",
      width: 225,
      cellRenderer: (params) => (
        <Tooltip title={params.value} placement="topLeft">
          <span
            style={{ cursor: "pointer", textDecoration: "underline dotted" }}
          >
            {params.value}
          </span>
        </Tooltip>
      ),
    },
    {
      field: "date",
      // valueFormatter: dateFormatter,
      spanRows: true, // Enable row spanning for the 'date' column
    },
    {
      field: "price",
      width: 330,
      // valueFormatter: (params) => {
      //   return "£" + params.value.toLocaleString();
      // },
    },
    {
      field: "successful",
      width: 320,
      cellRenderer: MissionResultRenderer,
    },
    { field: "rocket" },
    {
      headerName: "판매 정보",
      colId: "sales-detail",
      children: [
        { field: "location", headerName: "위치", width: 200 },
        { field: "rocket", headerName: "로켓", width: 200 },
      ],
    },
  ]);

  // Apply settings across all columns
  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      editable: true,
      // flex: 1,
    };
  }, []);

  const options = {
    // 범례(legend) 설정
    grid: {
      left: "10%", // 차트 왼쪽 여백을 10%로 설정
      right: "10%", // 차트 오른쪽 여백을 10%로 설정
      bottom: "10%", // 차트 아래쪽 여백을 10%로 설정
      containLabel: true, // 축 이름이 잘리지 않도록 그리드 영역을 확장
    },
    legend: {
      data: ["매출", "비용"],
      bottom: 0, // 범례를 하단에 배치
    },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "매출", // 범례에 표시될 이름
        data: [120, 200, 150, 80, 70, 110, 130],
        type: "bar",
      },
      {
        name: "비용", // 범례에 표시될 이름
        data: [100, 150, 120, 60, 50, 90, 100],
        type: "bar",
      },
    ],
  };

  /**
   * HSL 값을 RGB로 변환하여 16진수 컬러 코드를 반환합니다.
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {string} 16진수 컬러 코드 (예: #AABBCC)
   */
  function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;
    if (s === 0) {
      r = g = b = l; // 회색조
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * 중복되지 않고 구분이 명확한 색상 배열을 생성합니다.
   * @param {number} count - 생성할 색상의 개수.
   * @returns {string[]} 16진수 컬러 코드 배열.
   */
  function generateDistinctColors(count) {
    const colors = new Set();
    const step = Math.floor(360 / count);

    for (let i = 0; i < count; i++) {
      // Hue(색조)는 균등하게 나누고, Saturation과 Lightness는 고정
      const hue = i * step + Math.floor(Math.random() * step);
      const saturation = 80 + Math.random() * 20; // 채도를 높게
      const lightness = 60 + Math.random() * 10; // 명도를 중간 정도로 유지

      const hexColor = hslToHex(hue, saturation, lightness);

      // 중복 확인 후 Set에 추가
      if (!colors.has(hexColor)) {
        colors.add(hexColor);
      } else {
        i--; // 중복되면 다시 시도
      }
    }
    return [...colors];
  }

  // 사용 예제
  // const numberOfColors = 20;
  // const distinctColors = generateDistinctColors(numberOfColors);
  // console.log(distinctColors);
  // 예시 출력: [ '#d770c0', '#7b71d6', '#72b647', '#5ac49f', '#d56860', '#638c5b', '#48c3ce', '#35639f' ]

  const [gridApi, setGridApi] = useState(null);
  // Container: Defines the grid's theme & dimensions.
  return (
    <>
      <div style={{ width: "100%", height: "500px" }}>
        <AgGridReact
          onGridReady={(params) => {
            console.log("Grid is ready!", params);
            // params.api, params.columnApi 등 사용 가능
            setGridApi(params.api);
          }}
          enableCellSpan={true}
          rowData={data}
          loading={loading}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          rowSelection={rowSelection}
          onSelectionChanged={(event) => {
            // console.log("Row Selected!", event);
            // event.api.refreshCells({ columns: ['company'], force: true }); // 'company' 열만 다시 렌더링
            event.api.refreshCells({ force: true }); // 'company' 열만 다시 렌더링
            // 체크 해제 시에도 cellStyle이 호출되도록 전체 rows에 대해 강제 refresh
            // event.api.refreshCells({ force: true });
          }}
          onCellValueChanged={(event) => {
            const data = gridApi.getRenderedNodes().map((item) => item.data);
          }}
        />
      </div>

      <div style={{ width: "100%", height: "400px" }}>
        <ReactECharts option={options} />
      </div>
    </>
  );
};

export default App;
