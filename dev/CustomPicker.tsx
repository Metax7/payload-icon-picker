'use client'
import { IconPicker } from 'payload-icon-picker/client'
import React from 'react'
import * as LucideIcons from 'react-icons/lu'

// Example of a standalone picker that doesn't rely on the global provider
// It passes its own icons set directly to IconPicker
export const CustomPicker: React.FC<any> = (props) => {
  return (
    <IconPicker
      {...props}
      description="Standalone Picker (Custom Icons Pack)"
      icons={LucideIcons}
    />
  )
}
