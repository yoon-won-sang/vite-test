# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `pnpm dev`: Start development server (default: `http://localhost:5173`)
- `pnpm build`: Build for production
- `pnpm preview`: Preview production build
- `pnpm lint`: Run ESLint

## Architecture & Structure
This is a React 18 project built with Vite, TypeScript, Ant Design, and ag-Grid.
- `src/components/`: Contains various UI examples, including complex data grids (ag-Grid) and charts (ECharts).
- `src/stores/`: State management using Zustand.
- `src/workers/`: Web worker implementation for heavy computation.
- `src/types/`: TypeScript definitions.

## Key Technologies
- **UI:** Ant Design
- **Data Grid:** ag-Grid (various implementations in `components/`)
- **Charts:** ECharts (via `echarts-for-react`)
- **State:** Zustand
- **Async:** React Query
- **Tooling:** Vite, TypeScript, pnpm
