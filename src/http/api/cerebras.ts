import Cerebras from '@cerebras/cerebras_cloud_sdk';

const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY;

const client = new Cerebras({
  apiKey: apiKey
});

/**
 * Cerebras 流式对话接口封装
 */
export const generateCerebrasResumeStream = async (
  params: { messages: any[]; model?: string },
  onMessage: (content: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  try {
    const stream = await client.chat.completions.create({
      messages: params.messages,
      model: params.model || 'qwen-3-235b-a22b-instruct-2507',
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // Ensure the response matches the expected SSE format in original UI
        onMessage(`data: ${JSON.stringify({ data: content })}\n`);
      }
    }

    if (onComplete) {
      onComplete();
    }
  } catch (error) {
    console.error('Cerebras Stream Error:', error);
    onError(error);
  }
};

/**
 * Cerebras 普通对话接口封装（非流式）
 */
export const generateCerebrasResume = async (params: { messages: any[]; model?: string }) => {
  try {
    const response = await client.chat.completions.create({
      messages: params.messages,
      model: params.model || 'qwen-3-235b-a22b-instruct-2507',
      stream: false
    });
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Cerebras Completion Error:', error);
    throw error;
  }
};

export default client;
