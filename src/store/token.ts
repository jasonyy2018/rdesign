import { defineStore } from 'pinia';

// 用户信息
export const useTokenStore = defineStore('tokenStore', () => {
  const token = ref<string | null>('guest_token_mock');
  function saveToken(tokenStr: string) {
    console.log('Token mock active, skipping save');
  }
  return {
    token,
    saveToken
  };
});
