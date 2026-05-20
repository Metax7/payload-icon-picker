'use client'

import * as Lucide from 'lucide-react'
import { IconPackProvider as BaseProvider } from 'payload-icon-picker/client'
import React from 'react'

export const IconPackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseProvider icons={Lucide}>{children}</BaseProvider>
}
