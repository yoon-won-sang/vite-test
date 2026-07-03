import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

type BrushRect = {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: 'blue' | 'red'
}

const palette = {
  blue: { fill: 'rgba(0, 122, 255, 0.18)', stroke: '#006cff' },
  red: { fill: 'rgba(255, 47, 75, 0.18)', stroke: '#ff2f4b' },
}

const MIN_SIZE = 20

const BrushExample: React.FC = () => {
  const chartRef = useRef<any>(null)
  const dragStateRef = useRef<{ startX: number; startY: number; color: 'blue' | 'red' } | null>(
    null,
  )
  const brushColorRef = useRef<'blue' | 'red'>('blue')
  const [brushColor, setBrushColor] = useState<'blue' | 'red'>('blue')
  const [brushRects, setBrushRects] = useState<BrushRect[]>([])
  const [tempRect, setTempRect] = useState<BrushRect | null>(null)

  const data = useMemo(
    () => [
      [10.0, 8.04],
      [8.07, 6.95],
      [13.0, 7.58],
      [9.05, 8.81],
      [11.0, 8.33],
      [14.0, 7.66],
      [13.4, 6.81],
      [10.0, 6.33],
      [14.0, 8.96],
      [12.5, 6.82],
      [9.15, 7.2],
      [11.5, 7.2],
      [3.03, 4.23],
      [12.2, 7.83],
      [2.02, 4.47],
      [1.05, 3.33],
      [4.05, 4.96],
      [6.03, 7.24],
      [12.0, 6.26],
      [12.0, 8.84],
      [7.08, 5.82],
      [5.02, 5.68],
    ],
    [],
  )

  const getEventXY = useCallback((event: any) => {
    const native = event.event || event
    const zr = native.target?.getZr ? native.target.getZr() : chartRef.current?.getZr?.()
    if (!zr || !zr.domRoot) {
      return { x: native.offsetX ?? 0, y: native.offsetY ?? 0 }
    }
    const rect = zr.domRoot.getBoundingClientRect()
    return {
      x: native.clientX - rect.left,
      y: native.clientY - rect.top,
    }
  }, [])

  const createGraphicElements = useCallback(
    (rects: BrushRect[]) =>
      rects.flatMap((rect) => {
        const rectGraphic = {
          id: rect.id,
          type: 'rect',
          shape: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          style: {
            fill: palette[rect.color].fill,
            stroke: palette[rect.color].stroke,
            lineWidth: 2,
          },
          draggable: true,
          cursor: 'move',
          z: 100,
          ondrag: (event: any) => {
            const nextX = event.target.shape.x
            const nextY = event.target.shape.y
            setBrushRects((prev) =>
              prev.map((r) => (r.id === rect.id ? { ...r, x: nextX, y: nextY } : r)),
            )
          },
        }

        const half = 6
        const handlePoints = [
          { corner: 'nw' as const, x: rect.x, y: rect.y, cursor: 'nwse-resize' },
          { corner: 'ne' as const, x: rect.x + rect.width, y: rect.y, cursor: 'nesw-resize' },
          { corner: 'sw' as const, x: rect.x, y: rect.y + rect.height, cursor: 'nesw-resize' },
          {
            corner: 'se' as const,
            x: rect.x + rect.width,
            y: rect.y + rect.height,
            cursor: 'nwse-resize',
          },
        ].map(({ corner, x, y, cursor }) => ({
          id: `${rect.id}-handle-${corner}`,
          type: 'circle',
          shape: {
            cx: x,
            cy: y,
            r: half,
          },
          style: {
            fill: '#ffffff',
            stroke: palette[rect.color].stroke,
            lineWidth: 2,
          },
          cursor,
          draggable: true,
          z: 101,
          ondrag: (event: any) => {
            const nextX = event.target.shape.cx
            const nextY = event.target.shape.cy
            setBrushRects((prev) =>
              prev.map((r) => {
                if (r.id !== rect.id) return r
                const left = r.x
                const top = r.y
                const right = r.x + r.width
                const bottom = r.y + r.height
                switch (corner) {
                  case 'nw':
                    return {
                      ...r,
                      x: Math.min(nextX, right - MIN_SIZE),
                      y: Math.min(nextY, bottom - MIN_SIZE),
                      width: Math.max(MIN_SIZE, right - nextX),
                      height: Math.max(MIN_SIZE, bottom - nextY),
                    }
                  case 'ne':
                    return {
                      ...r,
                      y: Math.min(nextY, bottom - MIN_SIZE),
                      width: Math.max(MIN_SIZE, nextX - left),
                      height: Math.max(MIN_SIZE, bottom - nextY),
                    }
                  case 'sw':
                    return {
                      ...r,
                      x: Math.min(nextX, right - MIN_SIZE),
                      width: Math.max(MIN_SIZE, right - nextX),
                      height: Math.max(MIN_SIZE, nextY - top),
                    }
                  case 'se':
                    return {
                      ...r,
                      width: Math.max(MIN_SIZE, nextX - left),
                      height: Math.max(MIN_SIZE, nextY - top),
                    }
                  default:
                    return r
                }
              }),
            )
          },
        }))

        return [rectGraphic, ...handlePoints]
      }),
    [],
  )

  const option = useMemo<EChartsOption>(() => {
    return {
      title: {
        text: 'ECharts Brush Example',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: ({ data }: any) => `x: ${data[0]}<br/>y: ${data[1]}`,
      },
      xAxis: {
        type: 'value',
        name: 'X',
        min: 0,
        max: 15,
      },
      yAxis: {
        type: 'value',
        name: 'Y',
        min: 0,
        max: 15,
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '16%',
        bottom: '12%',
      },
      series: [
        {
          type: 'scatter',
          data,
          symbolSize: 20,
          itemStyle: {
            color: '#2f5cff',
          },
        },
      ],
      graphic: createGraphicElements(tempRect ? [...brushRects, tempRect] : brushRects),
    }
  }, [brushRects, createGraphicElements, data, tempRect])

  const handleChartReady = useCallback(
    (chart: any) => {
      chartRef.current = chart
      const zr = chart.getZr?.()
      if (!zr) return

      const shouldIgnoreTarget = (target: any) => {
        if (!target) return false
        if (typeof target.id === 'string') {
          return target.id.startsWith('brush-') || target.id === '__temp__'
        }
        return false
      }

      const handleMouseDown = (event: any) => {
        if (event.which !== 1) return
        if (shouldIgnoreTarget(event.target)) return
        const { x, y } = getEventXY(event)
        dragStateRef.current = { startX: x, startY: y, color: brushColorRef.current }
        setTempRect({ id: '__temp__', x, y, width: 0, height: 0, color: brushColorRef.current })
      }

      const handleMouseMove = (event: any) => {
        if (!dragStateRef.current) return
        const { x, y } = getEventXY(event)
        const { startX, startY, color } = dragStateRef.current
        const rectX = Math.min(startX, x)
        const rectY = Math.min(startY, y)
        const width = Math.abs(x - startX)
        const height = Math.abs(y - startY)
        setTempRect({ id: '__temp__', x: rectX, y: rectY, width, height, color })
      }

      const handleMouseUp = () => {
        if (!dragStateRef.current) return
        dragStateRef.current = null
        setTempRect((current) => {
          if (!current || current.width < MIN_SIZE || current.height < MIN_SIZE) return null
          setBrushRects((prev) => [...prev, { ...current, id: `brush-${Date.now()}` }])
          return null
        })
      }

      zr.on('mousedown', handleMouseDown)
      zr.on('mousemove', handleMouseMove)
      zr.on('mouseup', handleMouseUp)

      return () => {
        zr.off('mousedown', handleMouseDown)
        zr.off('mousemove', handleMouseMove)
        zr.off('mouseup', handleMouseUp)
      }
    },
    [getEventXY],
  )

  useEffect(() => {
    return () => {
      if (!chartRef.current) return
      const zr = chartRef.current.getZr?.()
      zr?.off('mousedown')
      zr?.off('mousemove')
      zr?.off('mouseup')
    }
  }, [])

  const handleSelectBrush = (color: 'blue' | 'red') => {
    brushColorRef.current = color
    setBrushColor(color)
  }

  const handleClear = () => {
    setBrushRects([])
    setTempRect(null)
  }

  return (
    <div className="card-section">
      <h2 style={{ marginTop: 0 }}>Brush Example</h2>
      <p style={{ marginBottom: 16 }}>
        파란색 또는 빨간색 버튼을 누른 다음, 차트 위에서 드래그하여 브러쉬 영역을 만드세요.
        <br />
        드래그 후에는 선택된 배경 영역이 graphic 객체로 독립적으로 그려집니다.
      </p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => handleSelectBrush('blue')}
          style={{
            border: brushColor === 'blue' ? '2px solid #006cff' : '1px solid #cccccc',
            background: brushColor === 'blue' ? '#e6f0ff' : '#ffffff',
            color: '#0047b3',
            padding: '8px 14px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Blue Brush
        </button>
        <button
          type="button"
          onClick={() => handleSelectBrush('red')}
          style={{
            border: brushColor === 'red' ? '2px solid #ff2f4b' : '1px solid #cccccc',
            background: brushColor === 'red' ? '#ffe9ec' : '#ffffff',
            color: '#b3001f',
            padding: '8px 14px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Red Brush
        </button>
        <button
          type="button"
          onClick={handleClear}
          style={{
            border: '1px solid #cccccc',
            background: '#ffffff',
            color: '#333333',
            padding: '8px 14px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Clear All
        </button>
      </div>
      <div style={{ background: 'white', padding: 12, borderRadius: 10 }}>
        <ReactECharts
          option={option}
          notMerge={true}
          onChartReady={handleChartReady}
          style={{ height: 440, width: '100%' }}
        />
      </div>
    </div>
  )
}

export default BrushExample
