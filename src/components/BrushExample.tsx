/**
 *
 * 부모화면과 팝업화면의 영역선택 기능의 기존 기능은 유지하면서 팝업을 오픈했들때 부모의 영역데이터를 팝업화면으로 동일하게 표시되고, 팝업화면이 닫을때 부모화면으로 동일하게 표시하고 싶어
 * 부모화면이나 자식화면에서  같은 색깔의 영역은 하나이다.
 *
 */
import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Modal, Button } from 'antd'
import type { SetStateAction } from 'react'

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

const MIN_SIZE = 10

interface BrushExampleContentProps {
  brushRects: BrushRect[]
  setBrushRects: React.Dispatch<SetStateAction<BrushRect[]>>
  brushColor: 'blue' | 'red'
  setBrushColor: React.Dispatch<SetStateAction<'blue' | 'red'>>
  selectedSeriesValues: [number, number][]
  setSelectedSeriesValues: React.Dispatch<SetStateAction<[number, number][]>>
  showSelectedValues: boolean
  setShowSelectedValues: React.Dispatch<SetStateAction<boolean>>
}

const BrushExampleContent: React.FC<BrushExampleContentProps> = ({
  brushRects,
  setBrushRects,
  brushColor,
  setBrushColor,
  selectedSeriesValues,
  setSelectedSeriesValues,
  showSelectedValues,
  setShowSelectedValues,
}) => {
  const chartRef = useRef<any>(null)
  const dragStateRef = useRef<{
    mode: 'create' | 'move' | 'resize'
    rectId?: string
    corner?: 'nw' | 'ne' | 'sw' | 'se'
    startX: number
    startY: number
    startRect?: BrushRect
  } | null>(null)
  const brushColorRef = useRef<'blue' | 'red'>('blue')
  const [tempRect, setTempRect] = useState<BrushRect | null>(null)

  const data = useMemo(
    () =>
      Array.from({ length: 50 }, () => [Math.random() * 15, Math.random() * 15]) as [
        number,
        number,
      ][],
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

  const getSeriesValuesInRect = useCallback(
    (rect: BrushRect | null) => {
      if (!rect) return [] as [number, number][]

      const chart = chartRef.current
      if (!chart?.convertToPixel) return [] as [number, number][]

      const x1 = rect.x
      const y1 = rect.y
      const x2 = rect.x + rect.width
      const y2 = rect.y + rect.height

      return data.filter(([x, y]) => {
        const [pixelX, pixelY] = chart.convertToPixel({ seriesIndex: 0 }, [x, y]) as [
          number,
          number,
        ]
        return pixelX >= x1 && pixelX <= x2 && pixelY >= y1 && pixelY <= y2
      }) as [number, number][]
    },
    [data],
  )

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
          cursor: 'move',
          z: 100,
          // silent: true,
          onmousedown: (event: any) => {
            event?.stopPropagation?.()
            event?.preventDefault?.()
            const { x, y } = getEventXY(event)
            dragStateRef.current = {
              mode: 'move',
              rectId: rect.id,
              startX: x,
              startY: y,
              startRect: rect,
            }
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
          z: 101,
          onmousedown: (event: any) => {
            event?.stopPropagation?.()
            event?.preventDefault?.()
            const { x, y } = getEventXY(event)
            dragStateRef.current = {
              mode: 'resize',
              rectId: rect.id,
              corner,
              startX: x,
              startY: y,
              startRect: rect,
            }
          },
        }))

        return [rectGraphic, ...handlePoints]
      }),
    [getEventXY],
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
        z: 1000,
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
          symbolSize: MIN_SIZE,
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
          return (
            target.id.startsWith('brush-') ||
            target.id === '__temp__' ||
            target.id.includes('-handle-')
          )
        }
        return false
      }

      const handleMouseMove = (event: any) => {
        if (!dragStateRef.current) return
        const { x, y } = getEventXY(event)
        const state = dragStateRef.current

        if (state.mode === 'create') {
          const rectX = Math.min(state.startX, x)
          const rectY = Math.min(state.startY, y)
          const width = Math.abs(x - state.startX)
          const height = Math.abs(y - state.startY)
          setTempRect({
            id: '__temp__',
            x: rectX,
            y: rectY,
            width,
            height,
            color: brushColorRef.current,
          })
          return
        }

        if (state.mode === 'move') {
          const startRect = state.startRect
          if (!startRect || !state.rectId) return
          const dx = x - state.startX
          const dy = y - state.startY
          setBrushRects((prev) => {
            const nextRects = prev.map((rect) =>
              rect.id === state.rectId
                ? {
                    ...rect,
                    x: startRect.x + dx,
                    y: startRect.y + dy,
                  }
                : rect,
            )

            const movedRect = nextRects.find((rect) => rect.id === state.rectId)
            if (movedRect) {
              setSelectedSeriesValues(getSeriesValuesInRect(movedRect))
              setShowSelectedValues(true)
            }

            return nextRects
          })
          return
        }

        if (!state.startRect || !state.rectId) return
        const nextX = x
        const nextY = y
        const left = state.startRect.x
        const top = state.startRect.y
        const right = left + state.startRect.width
        const bottom = top + state.startRect.height

        setBrushRects((prev) => {
          const nextRects = prev.map((rect) => {
            if (rect.id !== state.rectId) return rect
            switch (state.corner) {
              case 'nw':
                return {
                  ...rect,
                  x: Math.min(nextX, right - MIN_SIZE),
                  y: Math.min(nextY, bottom - MIN_SIZE),
                  width: Math.max(MIN_SIZE, right - nextX),
                  height: Math.max(MIN_SIZE, bottom - nextY),
                }
              case 'ne':
                return {
                  ...rect,
                  y: Math.min(nextY, bottom - MIN_SIZE),
                  width: Math.max(MIN_SIZE, nextX - left),
                  height: Math.max(MIN_SIZE, bottom - nextY),
                }
              case 'sw':
                return {
                  ...rect,
                  x: Math.min(nextX, right - MIN_SIZE),
                  width: Math.max(MIN_SIZE, right - nextX),
                  height: Math.max(MIN_SIZE, nextY - top),
                }
              case 'se':
                return {
                  ...rect,
                  width: Math.max(MIN_SIZE, nextX - left),
                  height: Math.max(MIN_SIZE, nextY - top),
                }
              default:
                return rect
            }
          })

          const resizedRect = nextRects.find((rect) => rect.id === state.rectId)
          if (resizedRect) {
            setSelectedSeriesValues(getSeriesValuesInRect(resizedRect))
            setShowSelectedValues(true)
          }

          return nextRects
        })
      }

      const handleMouseUp = () => {
        const state = dragStateRef.current
        dragStateRef.current = null

        if (state?.mode === 'create') {
          setTempRect((current) => {
            if (!current || current.width < MIN_SIZE || current.height < MIN_SIZE) return null
            const nextRect = { ...current, id: `brush-${Date.now()}` }
            setBrushRects((prev) => {
              // Remove existing rectangles with the same color
              const filtered = prev.filter((rect) => rect.color !== nextRect.color)
              return [...filtered, nextRect]
            })
            setSelectedSeriesValues(getSeriesValuesInRect(nextRect))
            setShowSelectedValues(true)
            return null
          })
        }
      }

      const handleGlobalMouseDown = (event: any) => {
        if (event.which !== 1) return
        if (shouldIgnoreTarget(event.target)) return
        event?.stopPropagation?.()
        event?.preventDefault?.()
        const { x, y } = getEventXY(event)
        dragStateRef.current = {
          mode: 'create',
          startX: x,
          startY: y,
        }
        setTempRect({ id: '__temp__', x, y, width: 0, height: 0, color: brushColorRef.current })
      }

      zr.on('mousedown', handleGlobalMouseDown)
      zr.on('mousemove', handleMouseMove)
      zr.on('mouseup', handleMouseUp)

      return () => {
        zr.off('mousedown', handleGlobalMouseDown)
        zr.off('mousemove', handleMouseMove)
        zr.off('mouseup', handleMouseUp)
      }
    },
    [getEventXY],
  )

  // useEffect(() => {
  //   return () => {
  //     if (!chartRef.current) return
  //     const zr = chartRef.current.getZr?.()
  //     zr?.off('mousedown')
  //     zr?.off('mousemove')
  //     zr?.off('mouseup')
  //   }
  // }, [])

  const handleSelectBrush = (color: 'blue' | 'red') => {
    brushColorRef.current = color
    setBrushColor(color)
  }

  const handleClear = () => {
    setBrushRects([])
    setTempRect(null)
    setSelectedSeriesValues([])
    setShowSelectedValues(false)
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
        <button
          type="button"
          onClick={() => setShowSelectedValues((prev) => !prev)}
          style={{
            border: '1px solid #006cff',
            background: '#f4f9ff',
            color: '#0047b3',
            padding: '8px 14px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {showSelectedValues ? 'Hide Selected Values' : 'Show Selected Values'}
        </button>
      </div>
      <div style={{ background: 'white', padding: 12, borderRadius: 10 }}>
        <ReactECharts
          option={option}
          notMerge={true}
          onChartReady={handleChartReady}
          style={{ height: 450, width: '100%' }}
        />
      </div>
      {showSelectedValues && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            border: '1px solid #d9e7ff',
            borderRadius: 8,
            background: '#f8fbff',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Selected Series Values</div>
          {selectedSeriesValues.length > 0 ? (
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: 12,
              }}
            >
              {JSON.stringify(selectedSeriesValues, null, 2)}
            </pre>
          ) : (
            <div style={{ color: '#666' }}>선택된 영역이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  )
}

const BrushExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [brushRects, setBrushRects] = useState<BrushRect[]>([])
  const [brushColor, setBrushColor] = useState<'blue' | 'red'>('blue')
  const [selectedSeriesValues, setSelectedSeriesValues] = useState<[number, number][]>([])
  const [showSelectedValues, setShowSelectedValues] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="card-section">
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Brush Example</h2>
        <Button type="primary" size="large" onClick={showModal}>
          Open as Modal
        </Button>
      </div>
      <BrushExampleContent
        brushRects={brushRects}
        setBrushRects={setBrushRects}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        selectedSeriesValues={selectedSeriesValues}
        setSelectedSeriesValues={setSelectedSeriesValues}
        showSelectedValues={showSelectedValues}
        setShowSelectedValues={setShowSelectedValues}
      />

      <Modal
        title="Brush Example - Modal View"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        <BrushExampleContent
          brushRects={brushRects}
          setBrushRects={setBrushRects}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          selectedSeriesValues={selectedSeriesValues}
          setSelectedSeriesValues={setSelectedSeriesValues}
          showSelectedValues={showSelectedValues}
          setShowSelectedValues={setShowSelectedValues}
        />
      </Modal>
    </div>
  )
}

export default BrushExample
