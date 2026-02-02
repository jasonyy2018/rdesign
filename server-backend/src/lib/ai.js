import Cerebras from '@cerebras/cerebras_cloud_sdk';
import dotenv from 'dotenv';

dotenv.config();

// 使用你提供的 Key 初始化 Cerebras 客户端
const aiClient = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY || 'csk-w4365x8x3hde35nnphn44jc4mtkntjyvfhym5x56yh9djwy2'
});

export default aiClient;
