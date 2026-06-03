/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config } from 'payload'

import { describe, expect, test } from 'vitest'

import { iconField, payloadIconPicker } from '../src/index.js'

describe('iconField Standalone Function', () => {
  test('should return a valid JSON field with default options and IconPicker component', () => {
    const field = iconField()
    expect(field.type).toBe('json')
    expect(field.name).toBe('icon')

    const adminField = field.admin?.components?.Field as any
    // Проверяем, что путь теперь указывает на новое имя компонента IconPicker
    expect(adminField.path).toBe('payload-icon-picker/client#IconPicker')
    expect(adminField.clientProps.label).toBe('Icon')
    expect(adminField.clientProps.hasMany).toBe(false)
  })

  test('should respect custom options (label, name, hasMany)', () => {
    const field = iconField({
      name: 'myCustomIcon',
      description: 'Choose your icons',
      hasMany: true,
      label: 'Select Icons',
    })

    expect(field.name).toBe('myCustomIcon')
    const adminField = field.admin?.components?.Field as any
    expect(adminField.clientProps.label).toBe('Select Icons')
    expect(adminField.clientProps.hasMany).toBe(true)
    expect(adminField.clientProps.description).toBe('Choose your icons')
  })

  test('should pass custom clientProps like displayMode to the component', () => {
    const field = iconField({
      name: 'drawerIcon',
      admin: {
        components: {
          Field: {
            clientProps: {
              displayMode: 'drawer',
            },
            path: 'payload-icon-picker/client#IconPicker',
          },
        },
      },
      label: 'Drawer Icon Picker',
    })

    const adminField = field.admin?.components?.Field as any
    expect(adminField.clientProps.displayMode).toBe('drawer')
  })

  test('should merge with provided admin config', () => {
    const field = iconField({
      admin: {
        position: 'sidebar',
      },
    })

    expect(field.admin?.position).toBe('sidebar')
  })
})

describe('payloadIconPicker Plugin Config', () => {
  test('should automatically inject icon field into specified collections', () => {
    const mockConfig = {
      collections: [
        {
          slug: 'posts',
          fields: [],
        },
        {
          slug: 'categories',
          fields: [],
        },
      ],
    } as unknown as Config

    const plugin = payloadIconPicker({
      name: 'globalIcon',
      collections: {
        categories: true, // Должен упасть в глобальный фолбек
        posts: {
          name: 'postIcon',
          hasMany: true,
        },
      },
      hasMany: false,
    })

    const result = plugin(mockConfig)
    const collections = result.collections || []

    const postsCollection = collections.find((c) => c.slug === 'posts')
    const postsField = postsCollection?.fields[0] as any

    expect(postsField.name).toBe('postIcon')
    expect(postsField.admin?.components?.Field?.clientProps?.hasMany).toBe(true)

    const categoriesCollection = collections.find((c) => c.slug === 'categories')
    const categoriesField = categoriesCollection?.fields[0] as any

    expect(categoriesField.name).toBe('globalIcon')
    expect(categoriesField.admin?.components?.Field?.clientProps?.hasMany).toBe(false)
  })

  test('should not add endpoints and providers if disabled is true', () => {
    const mockConfig = {
      collections: [
        {
          slug: 'posts',
          fields: [],
        },
      ],
    } as unknown as Config

    const plugin = payloadIconPicker({
      collections: {
        posts: true,
      },
      disabled: true,
    })

    const result = plugin(mockConfig)
    expect(result.endpoints).toBeUndefined()
    expect(result.admin?.components?.providers).toBeUndefined()
  })
})
