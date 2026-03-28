import { useRef, useState, useEffect, useMemo } from 'react'
import { Stage, Layer, Rect, Group } from 'react-konva'

const MORTAR_MM = 10
const DEFAULT_BRICK_L = 230
const DEFAULT_BRICK_H = 76
const DEFAULT_HEADER_W = 110
const CANVAS_H = 400
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
  viewW: number,
  wallH: number,
  brickL: number,
  brickH: number,
  headerW: number,
  bond: string,
  startX: number = 0,
): BrickData[] {
  const bricks: BrickData[] = []
  const endX = startX + viewW
  const rows = Math.ceil(wallH / (brickH + MORTAR_MM))

  for (let r = 0; r < rows; r++) {
    const y = r * (brickH + MORTAR_MM)
    const rowH = Math.min(brickH, wallH - y)
    if (rowH <= 0) break

    if (bond === 'english') {
      const isHeaderRow = r % 2 === 1
      const unitW = isHeaderRow ? headerW : brickL
      const step = unitW + MORTAR_MM
      const rowOffset = isHeaderRow ? (headerW + MORTAR_MM) / 2 : 0
      const firstCol = Math.floor((startX - rowOffset) / step) - 1
      for (let c = firstCol; ; c++) {
        const wx = c * step + rowOffset
        if (wx >= endX) break
        if (wx + unitW <= startX) continue
        const localX = Math.max(0, wx - startX)
        const localRight = Math.min(viewW, wx + unitW - startX)
        const w = localRight - localX
        if (w > 0) bricks.push({ x: localX, y, w, h: rowH })
      }
    } else if (bond === 'flemish') {
      const stretcherUnit = brickL + MORTAR_MM
      const headerUnit = headerW + MORTAR_MM
      const pairW = stretcherUnit + headerUnit
      if (pairW <= 0) continue
      const isOddRow = r % 2 === 1
      const rowOffset = isOddRow ? pairW / 2 : 0
      const firstPair = Math.floor((startX - rowOffset) / pairW) - 1
      for (let p = firstPair; ; p++) {
        const sxBase = p * pairW + rowOffset
        if (sxBase >= endX) break
        const sx = sxBase
        if (sx + brickL > startX && sx < endX) {
          const localX = Math.max(0, sx - startX)
          const localRight = Math.min(viewW, sx + brickL - startX)
          const w = localRight - localX
          if (w > 0) bricks.push({ x: localX, y, w, h: rowH })
        }
        const hx = sxBase + stretcherUnit
        if (hx + headerW > startX && hx < endX) {
          const localX = Math.max(0, hx - startX)
          const localRight = Math.min(viewW, hx + headerW - startX)
          const w = localRight - localX
          if (w > 0) bricks.push({ x: localX, y, w, h: rowH })
        }
        if (sxBase + pairW >= endX) break
      }
    } else {
      const step = brickL + MORTAR_MM
      const rowOffset = r % 2 === 1 ? step / 2 : 0
      const firstCol = Math.floor((startX - rowOffset) / step) - 1
      for (let c = firstCol; ; c++) {
        const wx = c * step + rowOffset
        if (wx >= endX) break
        if (wx + brickL <= startX) continue
        const localX = Math.max(0, wx - startX)
        const localRight = Math.min(viewW, wx + brickL - startX)
        const w = localRight - localX
        if (w > 0) bricks.push({ x: localX, y, w, h: rowH })
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

  const scale = CANVAS_H / wallH

  const visibleWallW = containerWidth > 0 ? containerWidth / scale : wallW
  const wallFitsInView = wallW <= visibleWallW
  const renderW = Math.min(wallW, visibleWallW)
  const wallStartX = wallFitsInView ? 0 : (wallW - renderW) / 2

  const bricks = useMemo(
    () => generateBricks(renderW, wallH, brickL, brickH, headerW, bond, wallStartX),
    [renderW, wallH, brickL, brickH, headerW, bond, wallStartX],
  )

  const offsetX = wallFitsInView ? (containerWidth - wallW * scale) / 2 : 0

  if (!containerWidth) {
    return <div ref={containerRef} className="w-full h-8" />
  }

  return (
    <div ref={containerRef} className="w-full relative">
      <Stage width={containerWidth} height={CANVAS_H}>
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
        <>
          <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </>
      )}
    </div>
  )
}
