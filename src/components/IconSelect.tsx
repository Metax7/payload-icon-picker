'use client'

import { SelectInput, useField } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

import { useIconPack } from './IconPackContext.js'

interface IconOption {
  label: React.ReactNode
  value: string
}

export const IconSelect: React.FC<{
  description?: string
  hasMany?: boolean
  label: string
  path: string
}> = ({ description, hasMany, label, path }) => {
  const icons = useIconPack()
  const { setValue, value } = useField<any>({ path })
  const [inputValue, setInputValue] = useState('')
  const previewRef = React.useRef<HTMLDivElement>(null)

  const iconNames = useMemo(() => {
    if (!icons) {
      return []
    }
    return Object.keys(icons).filter((key) => {
      const item = icons[key]
      return typeof item === 'function' || (typeof item === 'object' && item !== null)
    })
  }, [icons])

  // Safe helper to extract selected icon names
  const selectedNames = useMemo(() => {
    if (!value) {
      return []
    }
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'object' && v !== null ? v.name : v)).filter(Boolean)
    }
    if (typeof value === 'object' && value !== null && 'name' in value) {
      return [value.name]
    }
    if (typeof value === 'string') {
      return [value]
    }
    return []
  }, [value])

  const options = useMemo(() => {
    if (!icons) {
      return []
    }

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

    if (!inputValue) {
      const initialSlice = iconNames.slice(0, 100).map(makeOption)
      selectedNames.forEach((name) => {
        if (!initialSlice.some((opt) => opt.value === name)) {
          initialSlice.unshift(makeOption(name))
        }
      })
      return initialSlice
    }

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

    selectedNames.forEach((name) => {
      if (name.toLowerCase().includes(searchLower) && !filtered.some((opt) => opt.value === name)) {
        filtered.unshift(makeOption(name))
      }
    })

    return filtered
  }, [icons, iconNames, inputValue, selectedNames])

  const filterOption = (option: IconOption, search: string) => {
    if (!search) {
      return true
    }
    return option.value.toLowerCase().includes(search.toLowerCase())
  }

  // Extract SVGs from DOM and save to Payload field
  React.useEffect(() => {
    if (selectedNames.length === 0) {
      return
    }

    const timer = setTimeout(() => {
      if (previewRef.current) {
        const svgElements = previewRef.current.querySelectorAll('svg')
        if (svgElements.length > 0) {
          const newValues = Array.from(svgElements).map((svgElement, index) => {
            const name = selectedNames[index]
            return {
              name,
              svg: svgElement.outerHTML,
            }
          })

          const currentVal = Array.isArray(value) ? value : value ? [value] : []
          const hasChanged =
            newValues.length !== currentVal.length ||
            newValues.some((v, i) => v.name !== currentVal[i]?.name || v.svg !== currentVal[i]?.svg)

          if (hasChanged) {
            setValue(hasMany ? newValues : newValues[0])
          }
        }
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [selectedNames, value, setValue, hasMany])

  return (
    <div className="field-type select" style={{ marginBottom: '20px' }}>
      <div style={{ alignItems: 'flex-end', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <SelectInput
            description={description}
            filterOption={filterOption}
            hasMany={hasMany}
            isClearable={true}
            label={label}
            name={path}
            onChange={(selected) => {
              if (!selected) {
                setValue(null)
                return
              }

              const selectedArray = Array.isArray(selected) ? selected : [selected]
              const newNames = selectedArray
                .map((s) => {
                  if (typeof s === 'string') {
                    return s
                  }
                  if (typeof s === 'object' && s !== null && 'value' in s) {
                    return s.value as string
                  }
                  return ''
                })
                .filter(Boolean)

              if (hasMany) {
                const currentArray = Array.isArray(value) ? value : []
                const nextValue = newNames.map((name) => {
                  const existing = currentArray.find((v: any) => v.name === name)
                  return existing || { name, svg: '' }
                })
                setValue(nextValue)
              } else {
                const name = newNames[0] || ''
                const currentObj =
                  typeof value === 'object' && value !== null && !Array.isArray(value)
                    ? value
                    : { name: '', svg: '' }
                setValue({
                  name,
                  svg: name === currentObj.name ? currentObj.svg : '',
                })
              }
            }}
            onInputChange={(newValue: string, actionMeta?: any) => {
              if (actionMeta && actionMeta.action !== 'input-change') {
                return
              }
              setInputValue(newValue)
            }}
            options={options as unknown as { label: string; value: string }[]}
            path={path}
            value={hasMany ? selectedNames : selectedNames[0] || ''}
          />
        </div>
      </div>
      
      {/* Hidden container to render selected icons and extract their SVGs */}
      <div ref={previewRef} style={{ display: 'none' }}>
        {selectedNames.map((name) => {
          const IconComponent = icons?.[name]
          return IconComponent ? <IconComponent key={name} /> : null
        })}
      </div>
      {/* <div className="field-description" style={{ marginTop: '4px' }}>
        <a
          href="https://react-icons.github.io/react-icons/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Find more icons here: https://react-icons.github.io/react-icons/
        </a>
      </div> */}
    </div>
  )
}

export default IconSelect
