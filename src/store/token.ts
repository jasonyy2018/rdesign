import { defineStore } from 'pinia';

// 用户信息
export const useTokenStore = defineStore('tokenStore', () => {
  const token = ref<string | null>('guest_token_mock');
  function setToken() {
    console.log('Token mock active, skipping save');
  }
  return {
    token,
    setToken
  };
});
