import type { Config, Field } from 'payload'

import { describe, expect, test } from 'vitest'

import { iconField, payloadIconPicker } from '../src/index.js'

describe('iconField Standalone Function', () => {
  test('should return a valid JSON field with default options', () => {
    const field = iconField()
    expect(field.type).toBe('json')
    expect(field.name).toBe('icon')
    
    const adminField = (field.admin?.components?.Field as any)
    expect(adminField.path).toBe('payload-icon-picker/client#IconSelect')
    expect(adminField.clientProps.label).toBe('Icon')
    expect(adminField.clientProps.hasMany).toBe(false)
  })

  test('should respect custom options (label, name, hasMany)', () => {
    const field = iconField({
      name: 'myCustomIcon',
      label: 'Select Icons',
      hasMany: true,
      description: 'Choose your icons',
    })
    
    expect(field.name).toBe('myCustomIcon')
    const adminField = (field.admin?.components?.Field as any)
    expect(adminField.clientProps.label).toBe('Select Icons')
    expect(adminField.clientProps.hasMany).toBe(true)
    expect(adminField.clientProps.description).toBe('Choose your icons')
  })

  test('should merge with provided admin config', () => {
    const field = iconField({
      admin: {
        position: 'sidebar',
        className: 'custom-class',
      },
    })
    
    expect(field.admin?.position).toBe('sidebar')
    expect((field.admin as any).className).toBe('custom-class')
    expect(field.admin?.components?.Field).toBeDefined()
  })
})

describe('payloadIconPicker Plugin Core Unit Tests', () => {
  test('should append field to collections when enabled', () => {
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
      iconPackProviderPath: './components/IconPackProvider#IconPackProvider',
    })

    const result = plugin(mockConfig)

    // Check if field was added to the posts collection
    const collections = result.collections || []
    const postsCollection = collections.find((c) => c.slug === 'posts')
    expect(postsCollection).toBeDefined()
    expect(postsCollection?.fields).toHaveLength(1)

    const addedField = postsCollection?.fields[0] as any
    expect(addedField.name).toBe('icon')
    expect(addedField.admin?.components?.Field?.path).toBe('payload-icon-picker/client#IconSelect')
  })

  test('should work without iconPackProviderPath', () => {
    const mockConfig = {
      collections: [],
    } as unknown as Config

    const plugin = payloadIconPicker({
      collections: {},
      // No iconPackProviderPath provided
    })

    const result = plugin(mockConfig)
    
    // Should not have any providers added
    const providers = result.admin?.components?.providers || []
    expect(providers).toHaveLength(0)
    
    // Should still have endpoints
    expect(result.endpoints).toHaveLength(1)
  })

  test('should respect custom field name option', () => {
    const mockConfig = {
      collections: [
        {
          slug: 'posts',
          fields: [],
        },
      ],
    } as unknown as Config

    const plugin = payloadIconPicker({
      name: 'customIconField',
      collections: {
        posts: true,
      },
    })

    const result = plugin(mockConfig)
    const collections = result.collections || []
    const postsCollection = collections.find((c) => c.slug === 'posts')
    const addedField = postsCollection?.fields[0] as any
    expect(addedField.name).toBe('customIconField')
  })

  test('should respect per-collection field options and override global ones', () => {
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
        categories: true, // Should fall back to global
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
    expect(result.admin).toBeUndefined()
  })
})
