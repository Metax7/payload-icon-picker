'use client'

import { IconPackProvider as BaseProvider } from 'payload-icon-picker/client'
import React from 'react'
import * as Lucide from 'react-icons/lu'
import * as PhosphorIcons from 'react-icons/pi'

export const IconPackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BaseProvider
      collections={{
        categories: PhosphorIcons,
      }}
      icons={Lucide}
    >
      {children}
    </BaseProvider>
  )
}
