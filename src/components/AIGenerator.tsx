'use client'

import { Button, ReactSelect, TextInput, FieldLabel } from '@payloadcms/ui'
import DOMPurify from 'dompurify'
import React, { useState, useMemo } from 'react'

interface AIGeneratorProps {
  defaultModel?: string
  defaultProvider?: string
  onSave: (svg: string) => void
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({
  defaultModel,
  defaultProvider = 'openrouter',
  onSave,
}) => {
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState(defaultProvider)
  const [model, setModel] = useState(defaultModel || '')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sanitizedSvg = useMemo(() => {
    if (!generatedSvg) return ''
    return DOMPurify.sanitize(generatedSvg, {
      USE_PROFILES: { svg: true },
    })
  }, [generatedSvg])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/icon-picker/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          model: model || undefined,
          prompt,
          provider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate icon')
      }

      setGeneratedSvg(data.svg)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeny = () => {
    setGeneratedSvg(null)
    setPrompt('')
  }

  const options = [
    { label: 'OpenRouter (Default)', value: 'openrouter' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'Google Gemini', value: 'google' },
  ]

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: '16px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <FieldLabel label="AI Icon Prompt" />
        <TextInput
          onChange={(e: any) => setPrompt(e.target.value)}
          path="ai-prompt"
          placeholder="e.g. A minimalist house icon"
          value={prompt}
        />
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <FieldLabel label="Provider" />
          <ReactSelect
            onChange={(val: any) => {
              if (typeof val === 'string') setProvider(val)
              else if (val && typeof val === 'object' && 'value' in val) setProvider(val.value as string)
            }}
            options={options}
            value={options.find((o) => o.value === provider)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel label="Model (Optional)" />
          <TextInput
            onChange={(e: any) => setModel(e.target.value)}
            path="ai-model"
            placeholder="Default for provider"
            value={model}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <FieldLabel label="API Key (Optional if OpenRouter free)" />
        <TextInput
          onChange={(e: any) => setApiKey(e.target.value)}
          path="ai-api-key"
          placeholder="Your API Key"
          value={apiKey}
        />
      </div>

      <Button disabled={loading || !prompt} onClick={handleGenerate} size="small">
        {loading ? 'Generating...' : 'Generate Icon'}
      </Button>

      {error && <div style={{ color: 'var(--theme-error-500)', fontSize: '12px' }}>{error}</div>}

      {generatedSvg && (
        <div
          style={{
            alignItems: 'center',
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '16px',
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
            style={{ height: '64px', width: '64px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button buttonStyle="primary" onClick={() => onSave(sanitizedSvg)} size="small">
              Save Icon
            </Button>
            <Button buttonStyle="secondary" onClick={handleDeny} size="small">
              Deny
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
