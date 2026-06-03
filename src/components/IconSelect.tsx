/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  ReactSelect,
  useDocumentInfo,
  useField,
} from '@payloadcms/ui'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { useIconPack } from './IconPackContext.js'

interface IconOption {
  label: React.ReactNode
  value: string
}

interface CustomMenuListProps {
  children: React.ReactNode | React.ReactNode[]
  focusedOption: { label: React.ReactNode; value: string } | null
  getValue: () => { label: React.ReactNode; value: string }[]
  options: { label: React.ReactNode; value: string }[]
  selectProps: unknown
}

const MenuList: React.FC<CustomMenuListProps> = (props) => {
  const { children, focusedOption } = props
  const parentRef = React.useRef<HTMLDivElement>(null)

  const childrenArray = React.useMemo(() => {
    return Array.isArray(children) ? children : children ? [children] : []
  }, [children])

  const rowVirtualizer = useVirtualizer({
    count: childrenArray.length,
    estimateSize: () => 38,
    getScrollElement: () => parentRef.current,
    overscan: 10,
  })

  const focusedIndex = React.useMemo(() => {
    if (!focusedOption) {
      return -1
    }
    return childrenArray.findIndex(
      (child) =>
        React.isValidElement(child) &&
        child.props &&
        (child.props as { data?: { value?: string } }).data?.value === focusedOption.value,
    )
  }, [childrenArray, focusedOption])

  React.useEffect(() => {
    if (focusedIndex !== -1) {
      rowVirtualizer.scrollToIndex(focusedIndex, { align: 'auto' })
    }
  }, [focusedIndex, rowVirtualizer])

  return (
    <div
      className="rs__menu-list"
      ref={parentRef}
      style={{
        maxHeight: '300px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
          width: '100%',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const child = childrenArray[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                height: `${virtualRow.size}px`,
                left: 0,
                position: 'absolute',
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                width: '100%',
              }}
            >
              {child}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const IconSelect: React.FC<{
  description?: string
  hasMany?: boolean
  icons?: Record<string, React.ComponentType<any>>
  label: string
  path: string
}> = ({ description, hasMany, icons: customIcons, label, path }) => {
  const iconPackContext = useIconPack()
  const { collectionSlug } = useDocumentInfo()

  const icons = useMemo<Record<string, any>>(() => {
    if (customIcons) {
      return customIcons
    }
    const collectionIcons =
      collectionSlug && iconPackContext?.collections
        ? iconPackContext.collections[collectionSlug]
        : undefined
    return collectionIcons ?? iconPackContext?.icons ?? {}
  }, [collectionSlug, iconPackContext, customIcons])

  const { disabled, setValue, showError, value } = useField<any>({ path })
  const [inputValue, setInputValue] = useState('')

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
      const selectedOpts = selectedNames.map(makeOption)
      const otherOpts = iconNames.filter((name) => !selectedNames.includes(name)).map(makeOption)
      return [...selectedOpts, ...otherOpts]
    }

    const searchLower = inputValue.toLowerCase()
    const filtered: IconOption[] = []

    for (let i = 0; i < iconNames.length; i++) {
      const name = iconNames[i]
      if (name.toLowerCase().includes(searchLower)) {
        filtered.push(makeOption(name))
      }
    }

    const selectedMatchingOpts = selectedNames
      .filter((name) => name.toLowerCase().includes(searchLower))
      .map(makeOption)

    const filteredUnique = filtered.filter((opt) => !selectedNames.includes(opt.value))

    return [...selectedMatchingOpts, ...filteredUnique]
  }, [icons, iconNames, inputValue, selectedNames])

  const filterOption = (option: IconOption, search: string) => {
    if (!search) {
      return true
    }
    return option.value.toLowerCase().includes(search.toLowerCase())
  }

  // Extract SVGs and save to Payload field
  React.useEffect(() => {
    if (selectedNames.length === 0) {
      return
    }

    const newValues = selectedNames.map((name) => {
      const IconComponent = icons?.[name]
      let svg = ''
      if (IconComponent) {
        try {
          svg = renderToStaticMarkup(<IconComponent />)
        } catch (e) {
          console.error(`Error rendering icon ${name}:`, e)
        }
      }
      return {
        name,
        svg,
      }
    })

    const currentVal = Array.isArray(value) ? value : value ? [value] : []
    const hasChanged =
      newValues.length !== currentVal.length ||
      newValues.some((v, i) => v.name !== currentVal[i]?.name || v.svg !== currentVal[i]?.svg)

    if (hasChanged) {
      setValue(hasMany ? newValues : newValues[0])
    }
  }, [selectedNames, value, setValue, hasMany, icons])

  const valueToRender = useMemo(() => {
    if (hasMany) {
      return selectedNames.map((name) => {
        const found = options.find((opt) => opt.value === name)
        return found || { label: name, value: name }
      })
    } else {
      const name = selectedNames[0]
      if (name) {
        const found = options.find((opt) => opt.value === name)
        return found || { label: name, value: name }
      }
      return undefined
    }
  }, [hasMany, selectedNames, options])

  const containerClassName = ['field-type', 'select', showError && 'error', disabled && 'read-only']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={containerClassName}
      id={`field-${path.replace(/\./g, '__')}`}
      style={{ marginBottom: '20px' }}
    >
      <FieldLabel label={label} path={path} />
      <div className="field-type__wrap">
        <FieldError path={path} showError={showError} />
        <ReactSelect
          components={{ MenuList }}
          disabled={disabled}
          filterOption={filterOption}
          id={path}
          isClearable={true}
          isMulti={hasMany}
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
          placeholder={label}
          showError={showError}
          value={valueToRender}
        />
      </div>
      {description && <FieldDescription description={description} path={path} />}
    </div>
  )
}

export default IconSelect
