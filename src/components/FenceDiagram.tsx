import { useRef, useState, useEffect, useMemo } from 'react'
import { Stage, Layer, Rect, Group } from 'react-konva'
import { getBond } from '../bonds/registry'
import type { BrickData } from '../bonds/types'

const CANVAS_H = 400
const MORTAR_FILL = '#c9b89a'
const ADJ_FILL = '#d49050'
const STRETCHER_PALETTE = [
  '#b85530',
  '#a34525',
  '#c05838',
  '#9e3f20',
  '#ba5c35',
  '#aa4a2c',
]
const STROKE_NORMAL = '#6a2208'
const STROKE_ADJ = '#9a5010'
const SHEEN_FILL = 'rgba(255,230,180,0.12)'

interface FenceDiagramProps {
  lengthM: number
  heightM: number
  bondPattern?: string
}

function hashNoise(row: number, index: number): number {
  const h = Math.sin(row * 91.3 + index * 7.17) * 43758.5453
  const frac = h - Math.floor(h)
  return (frac - 0.5) * 0.18
}

function adjustBrightness(hex: string, amount: number): string {
  const m = hex.replace('#', '')
  const r = parseInt(m.substring(0, 2), 16)
  const g = parseInt(m.substring(2, 4), 16)
  const b = parseInt(m.substring(4, 6), 16)
  const d = Math.round(amount * 255)
  const clamp = (v: number) => Math.max(0, Math.min(255, v + d))
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function brickFill(b: BrickData, idx: number): string {
  if (b.type === 'adj') return adjustBrightness(ADJ_FILL, hashNoise(b.row, idx))
  if (b.type === 'half') {
    const base = b.row % 2 === 0 ? '#6e2c12' : '#7e3418'
    return adjustBrightness(base, hashNoise(b.row, idx))
  }
  const base = STRETCHER_PALETTE[b.row % STRETCHER_PALETTE.length]
  return adjustBrightness(base, hashNoise(b.row, idx))
}

export default function FenceDiagram({ lengthM, heightM, bondPattern }: FenceDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const wallL = lengthM * 1000
  const wallHmm = heightM * 1000

  const bondResult = useMemo(() => {
    if (!bondPattern || wallL <= 0 || wallHmm <= 0) return null
    const bond = getBond(bondPattern) ?? getBond('stretcher')
    if (!bond) return null
    return bond.generate({ wallL, wallH: wallHmm })
  }, [bondPattern, wallL, wallHmm])

  const renderedW = bondResult?.wallW ?? wallL
  const renderedH = bondResult?.wallH ?? wallHmm

  const scale = renderedH > 0 ? CANVAS_H / renderedH : 1

  const visibleWallW = containerWidth > 0 ? containerWidth / scale : renderedW
  const wallFitsInView = renderedW <= visibleWallW
  const renderW = Math.min(renderedW, visibleWallW)
  const startX = wallFitsInView ? 0 : (renderedW - renderW) / 2
  const endX = startX + renderW

  const visibleBricks = useMemo(() => {
    if (!bondResult) return []
    return bondResult.bricks.filter((b) => b.x + b.w > startX && b.x < endX)
  }, [bondResult, startX, endX])

  const offsetX = wallFitsInView ? (containerWidth - renderedW * scale) / 2 : 0

  const strokePx = Math.max(0.5, 0.4 * scale * 4)
  const sheenH = 3 * scale

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
              height={renderedH * scale}
              fill={MORTAR_FILL}
            />
            {visibleBricks.map((b, i) => {
              const localX = (b.x - startX) * scale
              const localY = b.y * scale
              const w = b.w * scale
              const h = b.h * scale
              return (
                <Group key={`${b.row}-${b.x}-${i}`}>
                  <Rect
                    x={localX}
                    y={localY}
                    width={w}
                    height={h}
                    fill={brickFill(b, i)}
                    stroke={b.type === 'adj' ? STROKE_ADJ : STROKE_NORMAL}
                    strokeWidth={strokePx}
                    cornerRadius={0.5}
                  />
                  {sheenH > 0.5 && (
                    <Rect
                      x={localX}
                      y={localY}
                      width={w}
                      height={Math.min(sheenH, h)}
                      fill={SHEEN_FILL}
                      listening={false}
                    />
                  )}
                </Group>
              )
            })}
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
