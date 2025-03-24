import { assert } from 'console'
import type { NextApiRequest, NextApiResponse } from 'next'

type GenerateResponse = {
  stub?: string
  implementation?: string
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GenerateResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { spec, language, format } = req.body

    assert(format === 'json', `Unsupported fromat: ${format}`)


    return res.status(200).json({
      stub: "STUB",
      implementation: "IMPLEMENTATION",
    })
  } catch (error) {
    console.error('Error generating code:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate code',
    })
  }
}

