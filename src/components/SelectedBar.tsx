'use client'

import React from 'react'

interface SelectedBarProps {
  icons: Record<string, React.ComponentType<any>>
  onRemove: (name: string) => void
  selectedNames: string[]
}

export const SelectedBar: React.FC<SelectedBarProps> = ({ icons, onRemove, selectedNames }) => {
  if (selectedNames.length === 0) {
    return null
  }

  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px dashed var(--theme-success-200, #10b981)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
      }}
    >
      <div
        style={{
          color: 'var(--theme-success-600)',
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
          return (
            <button
              key={`selected-${name}`}
              onClick={() => onRemove(name)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-error-500, #ef4444)'
                e.currentTarget.style.color = 'var(--theme-error-500, #ef4444)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--theme-success-500)'
                e.currentTarget.style.color = 'var(--theme-text)'
              }}
              style={{
                alignItems: 'center',
                background: 'var(--theme-bg)',
                border: '1px solid var(--theme-success-500)',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                color: 'var(--theme-text)',
                cursor: 'pointer',
                display: 'flex',
                fontSize: '12px',
                gap: '6px',
                padding: '4px 8px',
                transition: 'all 0.1s ease',
              }}
              type="button"
            >
              {IconComponent && <IconComponent size={14} />}
              <span>{name}</span>
              <span style={{ fontSize: '10px', marginLeft: '2px', opacity: 0.5 }}>✕</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
