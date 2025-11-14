export type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  isStreaming?: boolean;
  sources?: string[]; // 引用元URLの配列
};
