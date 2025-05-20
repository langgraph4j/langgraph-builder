import type { NextApiRequest, NextApiResponse } from 'next'


const LANGGRAPH_API_URL = 'https://langgraph-gen-server-570601939772.us-central1.run.app/generate'

const URL = ( req: NextApiRequest ) => {

  const { language } = req.body
  if( language === 'java' ) {
    if( process.env.RUNNING_IN_DOCKER ) {
      const { headers: { host, "x-forwarded-proto": protocol = 'http' }  } = req;
      const port = host?.includes(':') ? host.split(':')[1] : '80'
      return `${protocol}://host.docker.internal:${port}/api/langgraph4j-gen`;
    }
    else {
      const { headers: { origin } } = req;
      return `${origin}/api/langgraph4j-gen`;  
    }
  }
  return LANGGRAPH_API_URL;

}

type SourceFile = {
  path: string
  content: string
}

type GenerateResponse = {
  stub?: string | SourceFile
  implementation?: string | SourceFile
  error?: string
  extraFiles?: Array<SourceFile>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GenerateResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }


  try {
    const { spec, language, format } = req.body
    const response = await fetch( URL(req), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spec,
        language,
        format,
        stub_module: 'stub',
      }),
    })

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()
    return res.status(200).json({
      stub: data.stub,
      implementation: data.implementation,
      extraFiles: data.extraFiles,
      error: data.error,
    })
  } catch (error) {
    console.error('Error generating code:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate code',
    })
  }
}
