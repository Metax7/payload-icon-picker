'use client'

import type { FuseResult } from 'fuse.js'

import { Drawer, DrawerToggler, useDrawerSlug, useModal } from '@payloadcms/ui'
import Fuse from 'fuse.js'
import React, { useCallback, useMemo, useState } from 'react'

import { IconGrid } from './IconGrid.js'
import { SelectedBar } from './SelectedBar.js'

interface DrawerModeProps {
  closeOnSelect?: boolean
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
  closeOnSelect,
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
  const { closeModal } = useModal()

  const focusSearchInput = useCallback((node: HTMLInputElement | null) => {
    if (!node) {
      return
    }

    node.focus()

    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      if (document.activeElement === node || !node.isConnected || attempts >= 10) {
        return
      }
      attempts += 1
      node.focus()
      timer = setTimeout(tick, 50)
    }

    timer = setTimeout(tick, 50)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  const handleSelect = useCallback(
    (name: string) => {
      onSelect(name)
      if (closeOnSelect && !hasMany) {
        closeModal(drawerSlug)
      }
    },
    [onSelect, closeOnSelect, hasMany, closeModal, drawerSlug],
  )

  const fuse = useMemo(() => {
    return new Fuse(iconNames, {
      includeScore: true,
      threshold: 0.3,
    })
  }, [iconNames])

  const filteredIconNames = useMemo(() => {
    if (!inputValue) {
      return iconNames
    }
    return fuse.search(inputValue).map((result: FuseResult<string>) => result.item)
  }, [iconNames, inputValue, fuse])

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
            ref={focusSearchInput}
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
            onSelect={handleSelect}
            selectedNames={selectedNames}
          />

          <SelectedBar icons={icons} onRemove={handleSelect} selectedNames={selectedNames} />
        </div>
      </Drawer>
    </div>
  )
}
