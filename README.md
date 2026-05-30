# Vite + React + ag-Grid + Ant Design

A modern example application demonstrating the integration of **Vite**, **React**, **ag-Grid**, and **Ant Design** components.

## Features

✨ **Fast Development** - Vite's lightning-fast build and HMR (Hot Module Replacement)  
🎨 **Beautiful UI** - Ant Design components for consistent design  
📊 **Data Grid** - ag-Grid for powerful data visualization and manipulation  
⚡ **Modern Stack** - React 18 with modern JavaScript  
📦 **Package Manager** - pnpm for efficient dependency management

## Project Structure

```
vite-test/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v8 or higher)

### Installation

1. Navigate to the project directory:
```bash
cd vite-test
```

2. Install dependencies using pnpm:
```bash
pnpm install
```

### Development

Start the development server:
```bash
pnpm dev
```

The application will automatically open in your default browser at `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The optimized production build will be generated in the `dist` directory.

### Preview Production Build

```bash
pnpm preview
```

## Key Components

### Ant Design Components Used

- **Card** - Container for sections
- **Table** - Display tabular data
- **Input/Input.Search** - Search functionality
- **Button** - Action buttons
- **Tag** - Status indicators
- **Space** - Layout spacing
- **Icons** (SearchOutlined, PlusOutlined)

### ag-Grid Features Demonstrated

- Column definitions with sorting and filtering
- Quick filter functionality
- CSV export
- Pagination
- Custom cell renderers (with Ant Design Tags)
- Responsive grid layout

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

## Technologies

- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[React](https://react.dev/)** - JavaScript library for building UIs
- **[ag-Grid](https://www.ag-grid.com/)** - Advanced data grid component
- **[Ant Design](https://ant.design/)** - Enterprise-class UI library
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client (included for API calls)

## License

This project is open source and available under the MIT License.
