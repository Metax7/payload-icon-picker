'use client'

import { Button } from '@payloadcms/ui'
import DOMPurify from 'dompurify'
import React from 'react'

interface SelectedBarProps {
  icons: Record<string, React.ComponentType<any>>
  onRemove: (name: string) => void
  selectedIconsMap?: Record<string, string>
  selectedNames: string[]
}

export const SelectedBar: React.FC<SelectedBarProps> = ({
  icons,
  onRemove,
  selectedIconsMap,
  selectedNames,
}) => {
  if (selectedNames.length === 0) {
    return null
  }

  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        Selected ({selectedNames.length}) — Click to remove:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {selectedNames.map((name) => {
          const IconComponent = icons?.[name]
          const isAI = name.startsWith('AI-')
          return (
            <Button
              buttonStyle="secondary"
              icon={
                IconComponent ? (
                  <IconComponent />
                ) : (
                  isAI && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(selectedIconsMap?.[name] || '', {
                          USE_PROFILES: { svg: true },
                        }),
                      }}
                      style={{ height: '20px', width: '20px' }}
                    />
                  )
                )
              }
              iconPosition="left"
              key={`selected-${name}`}
              margin={false}
              onClick={() => onRemove(name)}
              type="button"
            >
              <span>{name}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
