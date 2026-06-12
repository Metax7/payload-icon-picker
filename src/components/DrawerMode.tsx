'use client'

import { Drawer, DrawerToggler, useDrawerSlug } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

import { IconGrid } from './IconGrid.js'
import { SelectedBar } from './SelectedBar.js'

interface DrawerModeProps {
  disabled?: boolean
  drawerIconSize?: number
  drawerItemsPerRow?: number
  drawerRowHeight?: number
  hasMany?: boolean
  iconNames: string[]
  icons: Record<string, React.ComponentType<any>>
  label: string
  onSelect: (name: string) => void
  path: string
  selectedNames: string[]
}

export const DrawerMode: React.FC<DrawerModeProps> = ({
  disabled,
  drawerIconSize,
  drawerItemsPerRow,
  drawerRowHeight,
  hasMany,
  iconNames,
  icons,
  label,
  onSelect,
  path,
  selectedNames,
}) => {
  const [inputValue, setInputValue] = useState('')
  const drawerSlug = useDrawerSlug(`icon-picker-drawer-${path}`)

  const filteredIconNames = useMemo(() => {
    if (!inputValue) {
      return iconNames
    }
    const searchLower = inputValue.toLowerCase()
    return iconNames.filter((name) => name.toLowerCase().includes(searchLower))
  }, [iconNames, inputValue])

  return (
    <div className="field-type__wrap" style={{ position: 'relative' }}>
      <DrawerToggler
        className="btn btn--style-secondary"
        disabled={disabled}
        slug={drawerSlug}
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-start',
          margin: '0',
          padding: '10px',
          textAlign: 'left',
          width: '100%',
        }}
      >
        {selectedNames.length > 0 ? (
          hasMany ? (
            <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedNames.map((name) => {
                const IconComponent = icons?.[name]
                return (
                  <span
                    key={name}
                    style={{
                      alignItems: 'center',
                      background: 'var(--theme-elevation-100)',
                      borderRadius: '4px',
                      display: 'flex',
                      gap: '4px',
                      padding: '2px 6px',
                    }}
                  >
                    {IconComponent && <IconComponent size={14} />}
                    {name}
                  </span>
                )
              })}
            </div>
          ) : (
            (() => {
              const name = selectedNames[0]
              const IconComponent = icons?.[name]
              return (
                <div style={{ alignItems: 'center', display: 'flex', gap: '8px', width: '100%' }}>
                  {IconComponent && <IconComponent size={18} />}
                  <span style={{ fontWeight: '600' }}>{name}</span>
                  <span style={{ fontSize: '11px', marginLeft: 'auto', opacity: 0.3 }}>
                    Click to change
                  </span>
                </div>
              )
            })()
          )
        ) : (
          <span style={{ opacity: 0.5 }}>Click to select icon...</span>
        )}
      </DrawerToggler>

      <Drawer slug={drawerSlug} title={label || 'Select Icon'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
          <input
            aria-label="Search icons"
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search icons..."
            style={{
              background: 'var(--theme-input-bg)',
              border: '1px solid var(--theme-elevation-200)',
              borderRadius: '4px',
              color: 'var(--theme-text)',
              padding: '10px',
              width: '100%',
            }}
            type="search"
            value={inputValue}
          />
          <div style={{ fontSize: '12px', opacity: 0.6 }}>
            Found {filteredIconNames.length} icons
          </div>

          <IconGrid
            drawerIconSize={drawerIconSize}
            drawerItemsPerRow={drawerItemsPerRow}
            drawerRowHeight={drawerRowHeight}
            iconNames={filteredIconNames}
            icons={icons}
            onSelect={onSelect}
            selectedNames={selectedNames}
          />

          <SelectedBar icons={icons} onRemove={onSelect} selectedNames={selectedNames} />
        </div>
      </Drawer>
    </div>
  )
}
