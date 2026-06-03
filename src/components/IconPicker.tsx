/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { FieldDescription, FieldError, FieldLabel, useDocumentInfo, useField } from '@payloadcms/ui'
import React, { useMemo } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { DrawerMode } from './DrawerMode.js'
import { DropdownMode } from './DropdownMode.js'
import { useIconPack } from './IconPackContext.js'

export const IconPicker: React.FC<{
  description?: string
  displayMode?: 'drawer' | 'select'
  hasMany?: boolean
  icons?: Record<string, React.ComponentType<any>>
  label: string
  path: string
}> = ({ description, displayMode = 'select', hasMany, icons: customIcons, label, path }) => {
  const { setValue, showError, value } = useField<any>({ path })
  const context = useIconPack()

  const { collectionSlug } = useDocumentInfo()

  const icons = useMemo(() => {
    if (customIcons) {
      return customIcons
    }

    if (collectionSlug && context?.collections?.[collectionSlug]) {
      return context.collections[collectionSlug]
    }

    return context?.icons || {}
  }, [customIcons, context?.collections, context?.icons, collectionSlug])

  const iconNames = useMemo(() => {
    return Object.keys(icons).filter((key) => {
      const item = icons[key]
      return typeof item === 'function' || (typeof item === 'object' && item !== null)
    })
  }, [icons])

  const getIconSvg = (name: string): string => {
    const IconComponent = icons[name]
    if (!IconComponent) {
      return ''
    }
    try {
      return renderToStaticMarkup(<IconComponent />)
    } catch (_) {
      console.error(`Failed to render SVG for icon: ${name}`)
      return ''
    }
  }

  const selectedNames = useMemo(() => {
    if (!value) {
      return []
    }
    if (hasMany && Array.isArray(value)) {
      return value.map((v: any) => v?.name).filter(Boolean)
    }
    if (!hasMany && typeof value === 'object' && !Array.isArray(value)) {
      return value.name ? [value.name] : []
    }
    return []
  }, [value, hasMany])

  const options = useMemo(() => {
    return iconNames.map((name) => {
      const IconComponent = icons[name]
      return {
        label: (
          <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            {IconComponent && <IconComponent size={16} />}
            <span>{name}</span>
          </div>
        ),
        value: name,
      }
    })
  }, [iconNames, icons])

  const valueToRender = useMemo(() => {
    if (hasMany) {
      return selectedNames.map((name) => options.find((o) => o.value === name)).filter(Boolean)
    }
    const currentName = selectedNames[0]
    return currentName ? options.find((o) => o.value === currentName) || null : null
  }, [hasMany, selectedNames, options])

  const handleSelectChange = (name: string) => {
    const isAlreadySelected = selectedNames.includes(name)

    if (hasMany) {
      const currentArray = Array.isArray(value) ? value : []
      if (isAlreadySelected) {
        setValue(currentArray.filter((v: any) => v.name !== name))
      } else {
        const svg = getIconSvg(name)
        setValue([...currentArray, { name, svg }])
      }
    } else {
      if (isAlreadySelected) {
        setValue(null)
      } else {
        const svg = getIconSvg(name)
        setValue({ name, svg })
      }
    }
  }

  const handleDropdownChange = (selected: any) => {
    if (hasMany) {
      const newNames = (Array.isArray(selected) ? selected : [])
        .map((s) => (s && typeof s === 'object' && 'value' in s ? (s.value as string) : ''))
        .filter(Boolean)

      const currentArray = Array.isArray(value) ? value : []

      const nextValue = newNames.map((name) => {
        const existing = currentArray.find((v: any) => v.name === name)
        return existing || { name, svg: getIconSvg(name) }
      })
      setValue(nextValue)
    } else {
      const name = selected && 'value' in selected ? (selected.value as string) : ''
      if (name) {
        setValue({ name, svg: getIconSvg(name) })
      } else {
        setValue(null)
      }
    }
  }

  return (
    <div
      className={`field-type select ${showError ? 'error' : ''}`}
      id={`field-${path.replace(/\./g, '__')}`}
      style={{ marginBottom: '20px' }}
    >
      <FieldLabel label={label} path={path} />
      <FieldError path={path} showError={showError} />

      {displayMode === 'drawer' ? (
        <DrawerMode
          hasMany={hasMany}
          iconNames={iconNames}
          icons={icons}
          label={label}
          onSelect={handleSelectChange}
          path={path}
          selectedNames={selectedNames}
        />
      ) : (
        <DropdownMode
          filterOption={(option: any, rawInput: string) =>
            option.value.toLowerCase().includes(rawInput.toLowerCase())
          }
          label={label}
          onChange={handleDropdownChange}
          options={options}
          path={path}
          valueToRender={valueToRender}
        />
      )}

      {description && <FieldDescription description={description} path={path} />}
    </div>
  )
}

export default IconPicker
