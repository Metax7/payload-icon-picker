'use client'

import type { FuseResult } from 'fuse.js'

import { Drawer, DrawerToggler, useDrawerSlug } from '@payloadcms/ui'
import DOMPurify from 'dompurify'
import Fuse from 'fuse.js'
import React, { useMemo, useState } from 'react'

import { AIGenerator } from './AIGenerator.js'
import { IconGrid } from './IconGrid.js'
import { SelectedBar } from './SelectedBar.js'

interface DrawerModeProps {
  ai?: {
    defaultModel?: string
    defaultProvider?: 'anthropic' | 'google' | 'openai' | 'openrouter'
    enabled?: boolean
  }
  disabled?: boolean
  drawerIconSize?: number
  drawerItemsPerRow?: number
  drawerRowHeight?: number
  hasMany?: boolean
  iconNames: string[]
  icons: Record<string, React.ComponentType<any>>
  label: string
  onSelect: (name: string, aiSvg?: string) => void
  path: string
  selectedIconsMap: Record<string, string>
  selectedNames: string[]
}

export const DrawerMode: React.FC<DrawerModeProps> = ({
  ai,
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
  selectedIconsMap,
  selectedNames,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const drawerSlug = useDrawerSlug(`icon-picker-drawer-${path}`)

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
                    {IconComponent ? (
                      <IconComponent size={14} />
                    ) : (
                      name.startsWith('AI-') && (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(selectedIconsMap?.[name] || '', {
                              USE_PROFILES: { svg: true },
                            }),
                          }}
                          style={{ height: '14px', width: '14px' }}
                        />
                      )
                    )}
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
                  {IconComponent ? (
                    <IconComponent size={18} />
                  ) : (
                    name.startsWith('AI-') && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(selectedIconsMap?.[name] || '', {
                            USE_PROFILES: { svg: true },
                          }),
                        }}
                        style={{ height: '18px', width: '18px' }}
                      />
                    )
                  )}
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              aria-label="Search icons"
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search icons..."
              style={{
                background: 'var(--theme-input-bg)',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: '4px',
                color: 'var(--theme-text)',
                flex: 1,
                padding: '10px',
              }}
              type="search"
              value={inputValue}
            />
            {ai?.enabled && (
              <button
                className="btn btn--style-secondary"
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                style={{ padding: '10px' }}
                type="button"
              >
                {showAIGenerator ? 'Hide AI' : 'Generate with AI'}
              </button>
            )}
          </div>

          {ai?.enabled && showAIGenerator && (
            <AIGenerator
              defaultModel={ai.defaultModel}
              defaultProvider={ai.defaultProvider}
              onSave={(svg) => {
                const name = `AI-${Date.now()}`
                onSelect(name, svg)
                setShowAIGenerator(false)
              }}
            />
          )}
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

          <SelectedBar
            icons={icons}
            onRemove={onSelect}
            selectedIconsMap={selectedIconsMap}
            selectedNames={selectedNames}
          />
        </div>
      </Drawer>
    </div>
  )
}
