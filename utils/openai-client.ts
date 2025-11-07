import { ChatOpenAI } from '@langchain/openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI Credentials');
}

export const openai = new ChatOpenAI({
  temperature: 0,
  modelName: 'gpt-4o-mini', // 最も安価なモデル
});

export const openaiStream = new ChatOpenAI({
  temperature: 0,
  modelName: 'gpt-4o-mini', // 最も安価なモデル
  streaming: true,
});
