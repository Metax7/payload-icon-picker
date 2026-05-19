'use client'

import { IconPackProvider as BaseProvider } from '@metax7/payload-icon-picker/client'
import React from 'react'
import * as Lucide from 'react-icons/lu'

export const IconPackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseProvider icons={Lucide}>{children}</BaseProvider>
}
