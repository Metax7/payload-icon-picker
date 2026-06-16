import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI, openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { PayloadHandler } from 'payload'

export const generateIconHandler: PayloadHandler = async (req) => {
  try {
    const body = typeof req.json === 'function' ? await req.json() : (req as any).body
    const { prompt, provider, apiKey, model } = body

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    let aiModel: any

    // Use user-provided API key or fallback to server-side OpenRouter key
    const effectiveApiKey = apiKey || process.env.OPENROUTER_API_KEY || ''

    // If no user API key is provided, we MUST use OpenRouter (with server-side key if available)
    if (!apiKey) {
      const openrouter = createOpenAI({
        apiKey: effectiveApiKey,
        baseURL: 'https://openrouter.ai/api/v1',
      })
      aiModel = openrouter(model || 'google/gemini-2.0-flash-lite-preview-02-05:free')
    } else {
      // User provided an API key, use their preferred provider
      if (provider === 'openai') {
        const customOpenAI = createOpenAI({ apiKey })
        aiModel = customOpenAI(model || 'gpt-4o-mini')
      } else if (provider === 'anthropic') {
        const customAnthropic = createAnthropic({ apiKey })
        aiModel = customAnthropic(model || 'claude-3-5-sonnet-latest')
      } else if (provider === 'google') {
        const customGoogle = createGoogleGenerativeAI({ apiKey })
        aiModel = customGoogle(model || 'gemini-1.5-flash')
      } else {
        // OpenRouter with user's key
        const openrouter = createOpenAI({
          apiKey,
          baseURL: 'https://openrouter.ai/api/v1',
        })
        aiModel = openrouter(model || 'google/gemini-2.0-flash-lite-preview-02-05:free')
      }
    }

    const { text } = await generateText({
      model: aiModel,
      system:
        'You are an expert SVG designer. Generate a clean, optimized SVG icon based on the user prompt. ' +
        'Return ONLY the raw SVG code, no markdown, no explanations, no backticks. ' +
        'Ensure the SVG has viewBox="0 0 24 24" and use currentColor for strokes or fills where appropriate.',
      prompt: prompt,
    })

    const svg = text.trim().replace(/^```svg\n/, '').replace(/\n```$/, '').replace(/^```\n/, '').replace(/\n```$/, '')

    return Response.json({ svg })
  } catch (error: any) {
    console.error('Error generating icon:', error)
    return Response.json({ error: error.message || 'Failed to generate icon' }, { status: 500 })
  }
}
