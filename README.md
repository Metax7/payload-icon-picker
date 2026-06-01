# payload-icon-picker

A field plugin for Payload CMS 3.x that adds an icon picker. It renders a searchable dropdown inside the admin panel and saves the selected icon name and its raw SVG string to the database. This allows you to render the icons on your frontend without importing or bundling full icon packages.

## Features

- **Searchable field**: Search and select icons within the admin interface.
- **SVG extraction**: The raw SVG is extracted and saved directly to the database as JSON, meaning no icon package dependencies are required on your client-facing frontend.
- **Custom icon packs**: Supports any icon pack (such as `react-icons` or a custom set) by wrapping the admin panel with a client provider.
- **Standalone `iconField`**: Use the icon picker anywhere—in collections, blocks, or globals—using the exported `iconField` function.
- **Collection-specific packs**: Configure different sets of icons for different collections.
- **Multi-select support**: Supports choosing multiple icons if `hasMany: true` is set.

## Installation

Install the package in your Payload project:

```bash
# pnpm
pnpm add payload-icon-picker

# npm
npm install payload-icon-picker

# yarn
yarn add payload-icon-picker

# Bun
bun add payload-icon-picker
```

## Usage

### 1. Register the Plugin in `payload.config.ts`

The plugin can automatically add fields to collections and/or register a global icon provider.

```typescript
import { buildConfig } from 'payload'
import { payloadIconPicker } from 'payload-icon-picker'

export default buildConfig({
  plugins: [
    payloadIconPicker({
      // 1. (Optional) Auto-add fields to collections
      collections: {
        categories: true,
        posts: {
          name: 'postIcon',
          label: 'Post Icon',
        },
      },
      // 2. (Optional) Register a global provider for icons
      iconPackProviderPath: './components/IconPackProvider#IconPackProvider',
    }),
  ],
})
```

### 2. Create a Client Provider (Optional)

If you want to use a global set of icons, create a client-side provider. If you don't provide this, you'll need to pass icons directly to the field (see "Standalone Use" below).

Create a file (e.g., `components/IconPackProvider.tsx`):

```tsx
'use client'

import React from 'react'
import { IconPackProvider as BaseProvider } from 'payload-icon-picker/client'
import * as LucideIcons from 'react-icons/lu'
import * as FontAwesomeIcons from 'react-icons/fa'

export const IconPackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BaseProvider
      icons={LucideIcons} // Global fallback
      collections={{
        posts: FontAwesomeIcons, // Collection-specific
      }}
    >
      {children}
    </BaseProvider>
  )
}
```

## Advanced Usage

### Using in Blocks or Globals

You can use the `iconField` function to add the picker to any field array, such as Blocks:

```typescript
import { iconField } from 'payload-icon-picker'

export const MyBlock = {
  slug: 'iconBlock',
  fields: [
    iconField({
      name: 'icon',
      label: 'Block Icon',
      hasMany: false,
    }),
  ],
}
```

### Standalone (Isolated) Use

If you want to use a specific icon pack for a single field without registering a global provider, create a simple client-side wrapper:

**1. Create the wrapper (`components/MyCustomPicker.tsx`):**

```tsx
'use client'
import React from 'react'
import { IconSelect } from 'payload-icon-picker/client'
import * as MyIcons from 'lucide-react'

export const MyCustomPicker = (props) => (
  <IconSelect {...props} icons={MyIcons} />
)
```

**2. Use it in your field config:**

```typescript
import { iconField } from 'payload-icon-picker'

const myField = iconField({
  admin: {
    components: {
      Field: './components/MyCustomPicker#MyCustomPicker'
    }
  }
})
```

## Database Schema

The selected icon data is saved as a JSON object.

### Single Icon (`hasMany: false`):

```json
{
  "name": "LuActivity",
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>"
}
```

## Configuration Reference

### Plugin Options (`PayloadIconPickerConfig`)

| Option                     | Type                      | Default      | Description                                                                 |
| :------------------------- | :------------------------ | :----------- | :-------------------------------------------------------------------------- |
| **`collections`**          | `Record<string, boolean \| Options>` | `undefined`  | Dictionary of collection slugs to append the icon field to. |
| **`iconPackProviderPath`** | `string`                  | `undefined`  | Path to the global client provider. |
| **`name`**                 | `string`                  | `'icon'`     | Global fallback field name. |
| **`hasMany`**              | `boolean`                 | `false`      | Global fallback for multi-select. |
| **`label`**                | `string`                  | `'Icon'`     | Global fallback label. |
| **`disabled`**             | `boolean`                 | `false`      | If true, disables the plugin. |

### Field Options (`iconField`)

| Option            | Type          | Default      | Description                          |
| :---------------- | :------------ | :----------- | :----------------------------------- |
| **`name`**        | `string`      | `'icon'`     | Field name.                          |
| **`label`**       | `string`      | `'Icon'`     | Field label.                         |
| **`hasMany`**     | `boolean`     | `false`      | Enable multi-select.                 |
| **`description`** | `string`      | `undefined`  | Helper text.                         |
| **`admin`**       | `FieldAdmin`  | `undefined`  | Standard Payload admin field config. |
