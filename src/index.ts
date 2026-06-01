import type { CollectionSlug, Config, Field } from 'payload'

import { customEndpointHandler } from './endpoints/customEndpointHandler.js'

export type CollectionConfigOptions = {
  /**
   * The description for the icon field.
   */
  description?: string
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
}

export type PayloadIconPickerConfig = {
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, CollectionConfigOptions | true>>
  disabled?: boolean
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
}

export const iconField = (
  options: {
    admin?: Field['admin']
    description?: string
    hasMany?: boolean
    label?: string
    name?: string
  } = {},
): Field => {
  const { name = 'icon', admin, description, hasMany = false, label } = options

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
        Field: {
          clientProps: {
            description,
            hasMany,
            label: label ?? (hasMany ? 'Icons' : 'Icon'),
          },
          path: 'payload-icon-picker/client#IconSelect',
        },
        ...admin?.components,
      },
    },
    typescriptSchema: [
      () =>
        hasMany
          ? {
              type: 'array' as const,
              items: iconObjectSchema,
            }
          : iconObjectSchema,
    ],
  } as Field
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
              description: isObject ? collectionOptions.description : undefined,
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

    return config
  }
