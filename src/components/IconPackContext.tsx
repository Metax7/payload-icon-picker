'use client'

import React, { createContext, use } from 'react'

const IconPackContext = createContext<null | Record<string, React.ComponentType<any>>>(null)

export const IconPackProvider: React.FC<{
  children: React.ReactNode
  icons: Record<string, any>
}> = ({ children, icons }) => {
  return <IconPackContext value={icons}>{children}</IconPackContext>
}

export const useIconPack = () => use(IconPackContext)
