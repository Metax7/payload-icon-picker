/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ReactSelect } from '@payloadcms/ui'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useMemo } from 'react'

interface DropdownModeProps {
  disabled?: boolean
  filterOption: (option: any, rawInput: string) => boolean
  label: string
  onChange: (selected: any) => void
  options: any[]
  path: string
  valueToRender: any
}

const MenuList: React.FC<any> = (props) => {
  const { children, focusedOption } = props
  const parentRef = React.useRef<HTMLDivElement>(null)

  const childrenArray = useMemo(() => {
    return Array.isArray(children) ? children : children ? [children] : []
  }, [children])

  const rowVirtualizer = useVirtualizer({
    count: childrenArray.length,
    directDomUpdates: true,
    estimateSize: () => 38,
    getScrollElement: () => parentRef.current,
    overscan: 10,
    useFlushSync: false,
  })

  React.useEffect(() => {
    if (focusedOption && childrenArray.length > 0) {
      const index = childrenArray.findIndex(
        (child: any) => child.props.data.value === focusedOption.value,
      )
      if (index !== -1) {
        rowVirtualizer.scrollToIndex(index, { align: 'auto' })
      }
    }
  }, [focusedOption, childrenArray, rowVirtualizer])

  return (
    <div ref={parentRef} style={{ height: '250px', overflowY: 'auto' }}>
      <div
        ref={rowVirtualizer.containerRef}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
          width: '100%',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
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
            {childrenArray[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  )
}

export const DropdownMode: React.FC<DropdownModeProps> = ({
  disabled,
  filterOption,
  label,
  onChange,
  options,
  path,
  valueToRender,
}) => {
  return (
    <div className="field-type__wrap">
      <ReactSelect
        components={{ MenuList }}
        disabled={disabled}
        filterOption={filterOption}
        id={path}
        isClearable={true}
        isMulti={Array.isArray(valueToRender)}
        onChange={onChange}
        options={options}
        placeholder={label}
        value={valueToRender}
      />
    </div>
  )
}
