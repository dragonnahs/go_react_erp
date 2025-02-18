import request from '@/utils/request';

// 获取最火 Meme 币列表
export const getHotMemeTokens = () => {
  return request.get('/meme-tokens/hot');
}; 