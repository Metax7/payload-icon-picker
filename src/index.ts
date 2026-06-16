import type { CollectionSlug, Config, JSONField } from 'payload'

import { customEndpointHandler } from './endpoints/customEndpointHandler.js'
import { generateIconHandler } from './endpoints/generateIconHandler.js'

export type AIConfig = {
  defaultModel?: string
  defaultProvider?: 'anthropic' | 'google' | 'openai' | 'openrouter'
  enabled?: boolean
}

export type CollectionConfigOptions = {
  /**
   * AI configuration for the icon field.
   */
  ai?: AIConfig
  /**
   * The description for the icon field.
   */
  description?: string
  /**
   * Display mode for the icon field
   * @default 'select'
   */
  displayMode?: 'drawer' | 'select'
  /**
   * Icon size in drawer
   * @default 24
   */
  drawerIconSize?: number
  /**
   * Number of items to display per row in drawer
   * @default 20
   */
  drawerItemsPerRow?: number
  /**
   * Height of each row in drawer
   * @default 80
   */
  drawerRowHeight?: number
  /**
   * Allow selecting multiple icons
   */
  hasMany?: boolean
  /**
   * The label for the icon field.
   */
  label?: string
  /**
   * Field name for icon field
   */
  name?: string
  /**
   * Require an icon to be selected
   */
  required?: boolean
}

export type PayloadIconPickerConfig = {
  /**
   * AI configuration (global fallback).
   */
  ai?: AIConfig
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, CollectionConfigOptions | true>>
  disabled?: boolean
  /**
   * Display mode for the icon field
   * @default 'select'
   */
  displayMode?: 'drawer' | 'select'
  /**
   * Icon size in drawer
   * @default 24
   */
  drawerIconSize?: number
  /**
   * Number of items to display per row in drawer
   * @default 20
   */
  drawerItemsPerRow?: number
  /**
   * Height of each row in drawer
   * @default 80
   */
  drawerRowHeight?: number
  /**
   * Allow selecting multiple icons (global fallback)
   */
  hasMany?: boolean
  /**
   * Path to a client component that provides the icon pack.
   * This component should wrap IconPackProvider and pass the icons.
   * Example: 'path/to/IconPackProvider#IconPackProvider'
   */
  iconPackProviderPath?: string
  /**
   * The label for the icon field (global fallback)
   */
  label?: string
  /**
   * Field name for icon field (global fallback)
   */
  name?: string
  /**
   * Require an icon to be selected
   */
  required?: boolean
}

export const iconField = (
  options: {
    admin?: JSONField['admin']
    ai?: AIConfig
    description?: string
    displayMode?: 'drawer' | 'select'
    drawerIconSize?: number
    drawerItemsPerRow?: number
    drawerRowHeight?: number
    hasMany?: boolean
    label?: string
    name?: string
    required?: boolean
  } = {},
): JSONField => {
  const {
    name = 'icon',
    admin,
    ai,
    description,
    displayMode = 'select',
    drawerIconSize,
    drawerItemsPerRow,
    drawerRowHeight,
    hasMany = false,
    label,
    required = false,
  } = options

  const iconObjectSchema = {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      name: { type: 'string' as const },
      svg: { type: 'string' as const },
    },
    required: ['name', 'svg'],
  }

  return {
    name,
    type: 'json',
    admin: {
      position: 'sidebar',
      ...admin,
      components: {
        Cell: {
          clientProps: {},
          path: 'payload-icon-picker/client#IconCell',
        },
        Field: {
          clientProps: {
            ai,
            description,
            displayMode,
            drawerIconSize,
            drawerItemsPerRow,
            drawerRowHeight,
            hasMany,
            label: label ?? (hasMany ? 'Icons' : 'Icon'),
          },
          path: 'payload-icon-picker/client#IconPicker',
        },
        ...admin?.components,
      },
    },
    required,
    typescriptSchema: [
      () =>
        hasMany
          ? {
              type: 'array' as const,
              items: iconObjectSchema,
            }
          : iconObjectSchema,
    ],
  } as JSONField
}

export const payloadIconPicker =
  (pluginOptions: PayloadIconPickerConfig) =>
  (config: Config): Config => {
    if (pluginOptions.collections) {
      if (!config.collections) {
        config.collections = []
      }

      for (const collectionSlug in pluginOptions.collections) {
        const collection = config.collections.find(
          (collection) => collection.slug === collectionSlug,
        )

        if (collection) {
          const collectionOptions = pluginOptions.collections[collectionSlug]
          const isObject = typeof collectionOptions === 'object' && collectionOptions !== null

          collection.fields.push(
            iconField({
              name:
                isObject && collectionOptions.name !== undefined
                  ? collectionOptions.name
                  : pluginOptions.name,

              ai:
                isObject && collectionOptions.ai !== undefined
                  ? { ...pluginOptions.ai, ...collectionOptions.ai }
                  : pluginOptions.ai,

              description: isObject ? collectionOptions.description : undefined,

              displayMode:
                isObject && collectionOptions.displayMode !== undefined
                  ? collectionOptions.displayMode
                  : pluginOptions.displayMode,
              drawerIconSize:
                isObject && collectionOptions.drawerIconSize !== undefined
                  ? collectionOptions.drawerIconSize
                  : pluginOptions.drawerIconSize,

              drawerItemsPerRow:
                isObject && collectionOptions.drawerItemsPerRow !== undefined
                  ? collectionOptions.drawerItemsPerRow
                  : pluginOptions.drawerItemsPerRow,

              drawerRowHeight:
                isObject && collectionOptions.drawerRowHeight !== undefined
                  ? collectionOptions.drawerRowHeight
                  : pluginOptions.drawerRowHeight,

              hasMany:
                isObject && collectionOptions.hasMany !== undefined
                  ? collectionOptions.hasMany
                  : pluginOptions.hasMany,

              label:
                isObject && collectionOptions.label !== undefined
                  ? collectionOptions.label
                  : pluginOptions.label,
            }),
          )
        }
      }
    }

    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

    if (!config.admin.components.providers) {
      config.admin.components.providers = []
    }

    if (pluginOptions.iconPackProviderPath) {
      config.admin.components.providers.push(pluginOptions.iconPackProviderPath)
    }

    config.endpoints.push({
      handler: customEndpointHandler,
      method: 'get',
      path: '/my-plugin-endpoint',
    })

    config.endpoints.push({
      handler: generateIconHandler,
      method: 'post',
      path: '/icon-picker/generate',
    })

    return config
  }
