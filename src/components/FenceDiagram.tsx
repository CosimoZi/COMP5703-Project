import { useRef, useState, useEffect, useMemo } from 'react'
import { Stage, Layer, Rect, Group } from 'react-konva'

const MORTAR_MM = 10
const DEFAULT_BRICK_L = 230
const DEFAULT_BRICK_H = 76
const DEFAULT_HEADER_W = 110
const CANVAS_MAX_H = 300
const BRICK_FILL = '#c1440e'
const MORTAR_FILL = '#d4d0c8'

interface FenceDiagramProps {
  lengthM: number
  heightM: number
  bondPattern?: string
  brickLengthCm?: number
  brickHeightCm?: number
  headerWidthCm?: number
}

interface BrickData {
  x: number
  y: number
  w: number
  h: number
}

function generateBricks(
  wallW: number,
  wallH: number,
  brickL: number,
  brickH: number,
  headerW: number,
  bond: string,
): BrickData[] {
  const bricks: BrickData[] = []
  const rows = Math.ceil(wallH / (brickH + MORTAR_MM))

  for (let r = 0; r < rows; r++) {
    const y = r * (brickH + MORTAR_MM)
    const rowH = Math.min(brickH, wallH - y)
    if (rowH <= 0) break

    if (bond === 'english') {
      const isHeaderRow = r % 2 === 1
      const unitW = isHeaderRow ? headerW : brickL
      const cols = Math.ceil(wallW / (unitW + MORTAR_MM))
      const offset = isHeaderRow ? (headerW + MORTAR_MM) / 2 : 0
      for (let c = -1; c <= cols; c++) {
        const x = c * (unitW + MORTAR_MM) + offset
        if (x + unitW <= 0 || x >= wallW) continue
        const clippedX = Math.max(0, x)
        const clippedW = Math.min(unitW, wallW - clippedX, x + unitW - clippedX)
        if (clippedW > 0) bricks.push({ x: clippedX, y, w: clippedW, h: rowH })
      }
    } else if (bond === 'flemish') {
      const stretcherUnit = brickL + MORTAR_MM
      const headerUnit = headerW + MORTAR_MM
      const pairW = stretcherUnit + headerUnit
      const isOddRow = r % 2 === 1
      const offset = isOddRow ? (stretcherUnit + headerUnit) / 2 : 0
      let x = -offset
      while (x < wallW) {
        // stretcher
        if (x + brickL > 0 && x < wallW) {
          const cx = Math.max(0, x)
          const cw = Math.min(brickL, wallW - cx, x + brickL - cx)
          if (cw > 0) bricks.push({ x: cx, y, w: cw, h: rowH })
        }
        x += stretcherUnit
        // header
        if (x + headerW > 0 && x < wallW) {
          const cx = Math.max(0, x)
          const cw = Math.min(headerW, wallW - cx, x + headerW - cx)
          if (cw > 0) bricks.push({ x: cx, y, w: cw, h: rowH })
        }
        x += headerUnit
        if (pairW <= 0) break
      }
    } else {
      // stretcher bond (default)
      const cols = Math.ceil(wallW / (brickL + MORTAR_MM))
      const offset = r % 2 === 1 ? (brickL + MORTAR_MM) / 2 : 0
      for (let c = -1; c <= cols; c++) {
        const x = c * (brickL + MORTAR_MM) + offset
        if (x + brickL <= 0 || x >= wallW) continue
        const clippedX = Math.max(0, x)
        const clippedW = Math.min(brickL, wallW - clippedX, x + brickL - clippedX)
        if (clippedW > 0) bricks.push({ x: clippedX, y, w: clippedW, h: rowH })
      }
    }
  }

  return bricks
}

export default function FenceDiagram({
  lengthM,
  heightM,
  bondPattern,
  brickLengthCm,
  brickHeightCm,
  headerWidthCm,
}: FenceDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const wallW = lengthM * 1000
  const wallH = heightM * 1000
  const brickL = brickLengthCm ? brickLengthCm * 10 : DEFAULT_BRICK_L
  const brickH = brickHeightCm ? brickHeightCm * 10 : DEFAULT_BRICK_H
  const headerW = headerWidthCm ? headerWidthCm * 10 : DEFAULT_HEADER_W
  const bond = bondPattern || 'stretcher'

  const canvasH = Math.min(CANVAS_MAX_H, containerWidth * (wallH / wallW) || CANVAS_MAX_H)
  const scale = canvasH / wallH

  const visibleWallW = containerWidth > 0 ? containerWidth / scale : wallW
  const wallFitsInView = wallW <= visibleWallW
  const renderW = Math.min(wallW, visibleWallW)

  const bricks = useMemo(
    () => generateBricks(renderW, wallH, brickL, brickH, headerW, bond),
    [renderW, wallH, brickL, brickH, headerW, bond],
  )

  const offsetX = wallFitsInView ? (containerWidth - wallW * scale) / 2 : 0

  if (!containerWidth) {
    return <div ref={containerRef} className="w-full h-8" />
  }

  return (
    <div ref={containerRef} className="w-full relative">
      <Stage width={containerWidth} height={canvasH}>
        <Layer>
          <Group x={offsetX}>
            <Rect
              x={0}
              y={0}
              width={renderW * scale}
              height={wallH * scale}
              fill={MORTAR_FILL}
            />
            {bricks.map((b, i) => (
              <Rect
                key={i}
                x={b.x * scale}
                y={b.y * scale}
                width={b.w * scale}
                height={b.h * scale}
                fill={BRICK_FILL}
                cornerRadius={1}
              />
            ))}
          </Group>
        </Layer>
      </Stage>
      {!wallFitsInView && (
        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      )}
    </div>
  )
}
