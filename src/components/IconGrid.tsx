'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo, useRef } from 'react'

interface IconGridProps {
  iconNames: string[]
  icons: Record<string, React.ComponentType<any>>
  onSelect: (name: string) => void
  selectedNames: string[]
}

const ITEMS_PER_ROW = 20
const ROW_HEIGHT = 80

export const IconGrid: React.FC<IconGridProps> = ({
  iconNames,
  icons,
  onSelect,
  selectedNames,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const result: string[][] = []
    for (let i = 0; i < iconNames.length; i += ITEMS_PER_ROW) {
      result.push(iconNames.slice(i, i + ITEMS_PER_ROW))
    }
    return result
  }, [iconNames])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    directDomUpdates: true,
    estimateSize: () => ROW_HEIGHT,
    getScrollElement: () => containerRef.current,
    overscan: 5,
    useFlushSync: false,
  })

  return (
    <div
      ref={containerRef}
      style={{
        background: 'var(--theme-bg)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        height: '500px',
        overflowY: 'auto',
        padding: '8px',
      }}
    >
      <div
        ref={rowVirtualizer.containerRef}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index]

          return (
            <div
              data-index={virtualRow.index}
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              style={{
                display: 'grid',
                gap: '8px',
                gridTemplateColumns: `repeat(${ITEMS_PER_ROW}, 1fr)`,
                height: `${virtualRow.size}px`,
                left: 0,
                paddingBottom: '8px',
                position: 'absolute',
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                width: '100%',
              }}
            >
              {rowItems.map((name) => {
                const IconComponent = icons[name]
                const isSelected = selectedNames.includes(name)

                return (
                  <button
                    key={name}
                    onClick={() => onSelect(name)}
                    style={{
                      alignItems: 'center',
                      background: isSelected ? 'var(--theme-elevation-50)' : 'transparent',
                      border: isSelected
                        ? '1px solid var(--theme-success-500, #10b981)'
                        : '1px solid var(--theme-elevation-150)',
                      borderRadius: '6px',
                      color: 'var(--theme-text)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: '11px',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: '4px',
                      textAlign: 'center',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                    title={name}
                    type="button"
                  >
                    {IconComponent && (
                      <IconComponent
                        size={24}
                        style={{
                          color: isSelected ? 'var(--theme-success-500)' : 'inherit',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
