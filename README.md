# @metax7/payload-icon-picker

A field plugin for Payload CMS 3.x that adds an icon picker. It renders a searchable dropdown inside the admin panel and saves the selected icon name and its raw SVG string to the database. This allows you to render the icons on your frontend without importing or bundling full icon packages.

## Features

- **Searchable field**: Search and select icons within the admin interface.
- **SVG extraction**: The raw SVG is extracted and saved directly to the database as JSON, meaning no icon package dependencies are required on your client-facing frontend.
- **Custom icon packs**: Supports any icon pack (such as `react-icons` or a custom set) by wrapping the admin panel with a client provider.
- **Multi-select support**: Supports choosing multiple icons if `hasMany: true` is set.

## Installation

Install the package in your Payload project:

```bash
# pnpm
pnpm add @metax7/payload-icon-picker

# npm
npm install @metax7/payload-icon-picker

# yarn
yarn add @metax7/payload-icon-picker

# Bun
bun add @metax7/payload-icon-picker
```

## Usage

### 1. Create a Client Provider for your Icon Pack

Because Payload 3.0 uses Next.js App Router and Server Components, you need to expose a client-side provider with the icons you want to make available.

Create a file (e.g., `components/IconPackProvider.tsx`):

```tsx
'use client'

import React from 'react'
import { IconPackProvider as BaseProvider } from '@metax7/payload-icon-picker/client'
import * as LucideIcons from 'react-icons/lu'

export const IconPackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseProvider icons={LucideIcons}>{children}</BaseProvider>
}
```

### 2. Register the Plugin in `payload.config.ts`

Import and add the plugin to your `payload.config.ts`:

```typescript
import { buildConfig } from 'payload'
import { payloadIconPicker } from '@metax7/payload-icon-picker'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // ... other configurations
  plugins: [
    payloadIconPicker({
      collections: {
        categories: true,
        posts: true,
      },
      iconPackProviderPath: './components/IconPackProvider#IconPackProvider',
      name: 'icon', // optional, default is 'icon'
      hasMany: false, // optional, default is false
    }),
  ],
})
```

## Database Schema

The selected icon data is saved as a JSON object.

### Single Icon (`hasMany: false`):

```json
{
  "name": "LuActivity",
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"/></svg>"
}
```

### Multiple Icons (`hasMany: true`):

```json
[
  {
    "name": "LuActivity",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>"
  },
  {
    "name": "LuCamera",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>"
  }
]
```

## Frontend Rendering Example

Since the SVG code is stored in the database, you can render it directly using `dangerouslySetInnerHTML`:

```tsx
import React from 'react'

interface IconData {
  name: string
  svg: string
}

interface CardProps {
  item: {
    title: string
    icon?: IconData
  }
}

export const Card: React.FC<CardProps> = ({ item }) => {
  return (
    <div className="card">
      {item.icon?.svg && (
        <div
          className="icon-container"
          style={{ width: '24px', height: '24px' }}
          dangerouslySetInnerHTML={{ __html: item.icon.svg }}
        />
      )}
      <h3>{item.title}</h3>
    </div>
  )
}
```

## Configuration Reference

| Option                     | Type                      | Default      | Description                                                                 |
| :------------------------- | :------------------------ | :----------- | :-------------------------------------------------------------------------- |
| **`collections`**          | `Record<string, boolean>` | `undefined`  | Dictionary of collection slugs to append the icon field to.                 |
| **`iconPackProviderPath`** | `string`                  | _(Required)_ | Path to the client provider. Format: `'path/to/file#ExportedComponentName'` |
| **`name`**                 | `string`                  | `'icon'`     | Database field name key.                                                    |
| **`hasMany`**              | `boolean`                 | `false`      | If true, enables selecting multiple icons.                                  |
| **`disabled`**             | `boolean`                 | `false`      | If true, disables the plugin functionality while preserving schemas.        |

## Development

1. **Clone the repository**:
   ```bash
   git clone git@github.com:Metax7/payload-icon-picker.git
   cd payload-icon-picker
   ```
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Setup environment variables**:
   Create a `.env` file in the `dev` folder:
   ```env
   DATABASE_URL=mongodb://127.0.0.1:27017/payload-icon-picker
   PAYLOAD_SECRET=some-secret-key
   ```
4. **Start local dev server**:
   ```bash
   pnpm dev
   ```
