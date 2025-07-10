import { GoogleGenAI } from '@google/genai'
import { env } from '../env.ts'

const gemini = new GoogleGenAI({
  apiKey: env.GOOGLE_GENAI_API_KEY || '',
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: 'Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.',
      },
      {
        inlineData: {
          mimeType,
          data: audioAsBase64,
        }
      }
    ]
  })

  if (!response.text) {
    throw new Error('Failed to transcribe audio')
  }

  return response.text
}

export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: 'text-embedding-004',
    contents: [
      {
        text,
      }
    ],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
    }
  })

  if (!response.embeddings?.[0].values) {
    throw new Error('Failed to generate embeddings')
  }

  return response.embeddings[0].values
}

export async function generateAnswer(question: string, transcriptions: string[]) {
  const context = transcriptions.join('\n\n')

  const prompt = `
    Com base no text fornecido abaixo como contexto, responda a pergunta de forma clara e concisa em PT-BR.

    CONTEXTO:
    ${context}

    PERGUNTA:
    ${question}

    INSTRUÇÕES:
      - Use apenas informação contida no contexto para responder a pergunta;
      - Se a resposta não for encontrada no contexto, apenas responda "Não sei";
      - Seja preciso e objetivo na resposta;
      - Mantenha a pontuação adequada e divida a resposta em parágrafos quando for apropriado;
      - Mantenha um tom educativo e profissional.
      - Cite trechos relevantes do contexto se apropriado.
      - Se for citar o contexto, utilize o termo "conteúdo da aula".
  `.trim()

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
      {
        text: context,
      }
    ]
  })

  if (!response.text) {
    throw new Error('Failed to generate answer')
  }

  return response.text
}
