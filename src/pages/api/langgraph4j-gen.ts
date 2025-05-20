import { assert } from 'console'
import type { NextApiRequest, NextApiResponse } from 'next'
import { spawn } from 'child_process'
import { Source } from 'postcss'

type SourceFile = {
  path: string
  content: string
}
interface GenerateResponse {
  stub?: SourceFile
  implementation?: SourceFile
  error?: string
  extraFiles?: Array<SourceFile>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GenerateResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { spec, language, format } = req.body

    const { stub, implementation, extraFiles } = await callJavaGenerator( spec )    
    
    return res.status(200).json({
      stub,
      implementation,
      extraFiles
    })
  } catch (error) {
    console.error('Error generating code:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate code',
    })
  }
}

async function callJavaGenerator( spec: string ) {
  console.debug( "SPEC", spec );
  var result = ''
  var error = ''

  return new Promise<GenerateResponse>((resolve, reject) => {

    if( !process.env.LANGRAPH4J_GEN ) {
      reject( { error: "LANGRAPH4J_GEN environment variable not set" } );
      return;
    }
    
    // Spawn the external program (e.g., a Python script)
    const javaGen = spawn('java', [  '-jar', process.env.LANGRAPH4J_GEN ]);

    // Send input to the external program
    javaGen.stdin.write(spec);
    javaGen.stdin.write('\n');
    javaGen.stdin.end();

    // Receive output from the external program
    javaGen.stdout.on('data', data => {
      result += data.toString();
    });

    // Handle any errors
    javaGen.stderr.on('data', (data) => {
      error += data.toString();
    });

    // When the program exits
    javaGen.on('close', (code) => {
      console.log(`External program exited with code ${code}`);

      if( error!=='' ) {
        reject( { error } );
      }
      else {
        try {
          resolve( JSON.parse(result) );
        } catch (error) {
          reject( { error } );
        }
        
      }
    });
  });
}


// TEST

// const yaml = `
// name: CustomAgent
// nodes:
//   - name: Node 1
// edges:
//   - from: __start__
//     to: Node 1
//   - from: Node 1
//     to: __end__
// `

// callJavaGenerator( yaml )
//   .then( result => {
//     console.log( "RESULT", result );
//   })
//   .catch( error => {
//     console.error( "ERROR", error );
//   })