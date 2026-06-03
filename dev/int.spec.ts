/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Payload } from 'payload'

import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { customEndpointHandler } from '../src/endpoints/customEndpointHandler.js'

let payload: Payload

afterAll(async () => {
  if (payload) {
    await payload.destroy()
  }
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Plugin integration tests', () => {
  test('should query custom endpoint added by plugin', async () => {
    const request = new Request('http://localhost:3000/api/my-plugin-endpoint', {
      method: 'GET',
    })

    const payloadRequest = await createPayloadRequest({ config, request })
    const response = await customEndpointHandler(payloadRequest)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({
      message: 'Hello from custom endpoint',
    })
  })

  test('can create post with custom icon field containing verified SVG string', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        postIcons: [
          {
            name: 'LuActivity',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
          },
        ],
      },
    })

    expect(post.postIcons).toBeDefined()
    expect(Array.isArray(post.postIcons)).toBe(true)

    const icons = post.postIcons as { name?: string; svg?: string }[]
    expect(icons).toHaveLength(1)
    expect(icons[0]).toMatchObject({
      name: 'LuActivity',
    })

    // Проверяем, что наша новая функция генерации SVG сохраняет корректную XML разметку
    expect(icons[0].svg).toContain('<svg')
  })

  test('should register the iconPackProviderPath to admin providers config', () => {
    const providers = payload.config.admin?.components?.providers || []
    const hasProvider = providers.some((provider: any) => {
      if (typeof provider === 'string') {
        return provider.includes('IconPackProvider')
      }
      return false
    })

    expect(hasProvider).toBe(true)
  })
})
