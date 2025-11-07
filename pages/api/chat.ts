import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { openai } from '@/utils/openai-client';
import { supabaseClient } from '@/utils/supabase-client';
import { makeChain } from '@/utils/makechain';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  /* create vectorstore*/
  const embeddings = new OpenAIEmbeddings({ 
    model: 'text-embedding-3-small',
    dimensions: 512 
  });
  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    embeddings,
    {
      client: supabaseClient,
      tableName: 'documents',
      queryName: 'match_documents',
    }
  );

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  sendData(JSON.stringify({ data: '' }));

  const model = openai;
  // create the chain with streaming callback
  const chain = makeChain(vectorStore, (token: string) => {
    sendData(JSON.stringify({ data: token }));
  });

  try {
    //Ask a question with streaming (onTokenStream callback will handle streaming)
    await chain.invoke({
      question: sanitizedQuestion,
      chat_history: history || [],
    });
  } catch (error) {
    console.log('error', error);
    sendData(JSON.stringify({ error: String(error) }));
  } finally {
    sendData('[DONE]');
    res.end();
  }
}
