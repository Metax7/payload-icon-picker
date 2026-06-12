'use client'

import type { DefaultCellComponentProps, JSONFieldClient } from 'payload'

import { Button } from '@payloadcms/ui'
import React from 'react'

export const IconCell: React.FC<
  DefaultCellComponentProps<JSONFieldClient, Record<string, string> | Record<string, string>[]>
> = ({ cellData }) => {
  if (!cellData) {
    return <span>-</span>
  }

  const renderIcon = (icon: Record<string, string>) => {
    if (!icon || !icon.svg) {
      return null
    }
    return (
      <Button buttonStyle="subtle" key={icon.name} margin={false} size="xsmall" tooltip={icon.name}>
        <div
          dangerouslySetInnerHTML={{ __html: icon.svg }}
          style={{
            alignItems: 'center',
            display: 'inline-flex',
            height: '24px',
            justifyContent: 'center',
            width: '24px',
          }}
          title={icon.name}
        />
      </Button>
    )
  }

  if (Array.isArray(cellData)) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {cellData.map(renderIcon)}
      </div>
    )
  }

  return <div style={{ display: 'flex' }}>{renderIcon(cellData)}</div>
}

export default IconCell
