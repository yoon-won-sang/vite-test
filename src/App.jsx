'use client';
import { useFetchJson } from './useFetchJson';
// React Grid Logic
import React, { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

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
      {params.value}
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
  return new Date(params.value).toLocaleDateString("ko-KR", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  ]);

  // Apply settings across all columns
  const defaultColDef = useMemo(() => {
    return {
      filter: true,
      editable: true,
      flex: 1,
    };
  }, []);

  // Container: Defines the grid's theme & dimensions.
  return (
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
      />
    </div>
  );
};


export default App;