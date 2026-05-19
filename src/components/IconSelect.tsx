'use client'

import { SelectInput, useField } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

import { useIconPack } from './IconPackContext.js'

interface IconOption {
  label: React.ReactNode
  value: string
}

export const IconSelect: React.FC<{ label: string; path: string }> = ({ label, path }) => {
  const icons = useIconPack()
  const { setValue, value } = useField<{ name: string; svg: string } | null | string>({ path })
  const [inputValue, setInputValue] = useState('')
  const previewRef = React.useRef<HTMLDivElement>(null)

  const iconNames = useMemo(() => {
    if (!icons) {
      return []
    }
    return Object.keys(icons).filter((key) => {
      const item = icons[key]
      // react-icons are components (functions or objects)
      return typeof item === 'function' || (typeof item === 'object' && item !== null)
    })
  }, [icons])

  // Safe helper to extract selected icon name
  const selectedName = useMemo(() => {
    if (!value) {
      return ''
    }
    if (typeof value === 'object' && value !== null && 'name' in value) {
      return value.name || ''
    }
    if (typeof value === 'string') {
      return value
    }
    return ''
  }, [value])

  const options = useMemo(() => {
    if (!icons) {
      return []
    }

    // Helper to generate option label with icon preview
    const makeOption = (name: string): IconOption => {
      const IconComponent = icons[name]
      return {
        label: (
          <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            {IconComponent && (
              <IconComponent
                size={18}
                style={{ color: 'var(--theme-text, #1f2937)', flexShrink: 0 }}
              />
            )}
            <span>{name}</span>
          </div>
        ),
        value: name,
      }
    }

    // If there is no search query, return a small slice of 100 items
    if (!inputValue) {
      const initialSlice = iconNames.slice(0, 100).map(makeOption)
      // Ensure the currently selected value is included so it displays correctly
      if (selectedName && !iconNames.slice(0, 100).includes(selectedName)) {
        initialSlice.unshift(makeOption(selectedName))
      }
      return initialSlice
    }

    // Filter matching icons up to 100 items for high performance
    const searchLower = inputValue.toLowerCase()
    const filtered: IconOption[] = []

    for (let i = 0; i < iconNames.length; i++) {
      const name = iconNames[i]
      if (name.toLowerCase().includes(searchLower)) {
        filtered.push(makeOption(name))
        if (filtered.length >= 100) {
          break
        }
      }
    }

    // Ensure the currently selected value is included if it matches search
    if (
      selectedName &&
      selectedName.toLowerCase().includes(searchLower) &&
      !filtered.some((opt) => opt.value === selectedName)
    ) {
      filtered.unshift(makeOption(selectedName))
    }

    return filtered
  }, [icons, iconNames, inputValue, selectedName])

  const filterOption = (option: IconOption, search: string) => {
    if (!search) {
      return true
    }
    return option.value.toLowerCase().includes(search.toLowerCase())
  }

  const SelectedIconComponent = useMemo(() => {
    if (!selectedName || !icons) {
      return null
    }
    return icons[selectedName] || null
  }, [selectedName, icons])

  // Extract SVG from DOM and save to Payload field
  React.useEffect(() => {
    if (!selectedName) {
      return
    }

    const timer = setTimeout(() => {
      if (previewRef.current) {
        const svgElement = previewRef.current.querySelector('svg')
        if (svgElement) {
          const svgString = svgElement.outerHTML
          const currentSvg = typeof value === 'object' && value !== null ? value.svg : ''

          if (currentSvg !== svgString) {
            setValue({
              name: selectedName,
              svg: svgString,
            })
          }
        }
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [selectedName, value, setValue])

  return (
    <div className="field-type select" style={{ marginBottom: '20px' }}>
      <div style={{ alignItems: 'flex-end', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <SelectInput
            filterOption={filterOption}
            isClearable={true}
            label={label}
            name={path}
            onChange={(selected) => {
              if (!selected) {
                setValue(null)
                return
              }
              let newName = ''
              if (typeof selected === 'string') {
                newName = selected
              } else if (typeof selected === 'object' && 'value' in selected) {
                newName = selected.value as string
              } else if (Array.isArray(selected)) {
                const first = selected[0]
                if (first && typeof first === 'object' && 'value' in first) {
                  newName = first.value as string
                } else if (typeof first === 'string') {
                  newName = first
                }
              }
              setValue({
                name: newName,
                svg: '',
              })
            }}
            onInputChange={(newValue: string, actionMeta?: any) => {
              if (actionMeta && actionMeta.action !== 'input-change') {
                return
              }
              setInputValue(newValue)
            }}
            options={options as unknown as { label: string; value: string }[]}
            path={path}
            value={selectedName || ''}
          />
        </div>
        {SelectedIconComponent && (
          <div
            ref={previewRef}
            style={{
              alignItems: 'center',
              backgroundColor: 'var(--theme-elevation-100, #f3f4f6)',
              border: '1px solid var(--theme-elevation-150, #e5e7eb)',
              borderRadius: '8px',
              color: 'var(--theme-text, #1f2937)',
              display: 'flex',
              flexShrink: 0,
              height: '40px',
              justifyContent: 'center',
              width: '40px',
            }}
          >
            <SelectedIconComponent size={24} />
          </div>
        )}
      </div>
      <div className="field-description" style={{ marginTop: '4px' }}>
        <a href="https://react-icons.github.io/react-icons/" rel="noopener noreferrer" target="_blank">
          Find more icons here: https://react-icons.github.io/react-icons/
        </a>
      </div>
    </div>
  )
}

export default IconSelect
