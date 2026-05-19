import type { Config, Field } from 'payload'

import { describe, expect, test } from 'vitest'

import { payloadIconPicker } from '../src/index.js'

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

    const addedField = postsCollection?.fields[0] as {
      admin?: { components?: { Field?: { path?: string } } }
    } & Extract<Field, { name: string }>
    expect(addedField.name).toBe('icon')
    expect(addedField.type).toBe('json')
    expect(addedField.admin?.components?.Field?.path).toBe('payload-icon-picker/client#IconSelect')
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
      iconPackProviderPath: './components/IconPackProvider#IconPackProvider',
    })

    const result = plugin(mockConfig)
    const collections = result.collections || []
    const postsCollection = collections.find((c) => c.slug === 'posts')
    const addedField = postsCollection?.fields[0] as Extract<Field, { name: string }>
    expect(addedField.name).toBe('customIconField')
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
      iconPackProviderPath: './components/IconPackProvider#IconPackProvider',
    })

    const result = plugin(mockConfig)

    // It should still add the database field to preserve schema compatibility
    const collections = result.collections || []
    const postsCollection = collections.find((c) => c.slug === 'posts')
    expect(postsCollection?.fields).toHaveLength(1)

    // But should NOT add endpoints or admin components
    expect(result.endpoints).toBeUndefined()
    expect(result.admin).toBeUndefined()
  })

  test('should append admin provider and custom endpoint when enabled', () => {
    const mockConfig = {
      collections: [],
    } as unknown as Config

    const plugin = payloadIconPicker({
      iconPackProviderPath: './components/IconPackProvider#IconPackProvider',
    })

    const result = plugin(mockConfig)

    // Check custom endpoint
    expect(result.endpoints).toHaveLength(1)
    expect(result.endpoints?.[0].path).toBe('/my-plugin-endpoint')

    // Check provider
    expect(result.admin?.components?.providers).toContain(
      './components/IconPackProvider#IconPackProvider',
    )
  })
})
