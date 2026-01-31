import { defineStore } from 'pinia';

// 用户信息
export const useTokenStore = defineStore('tokenStore', () => {
  const token = ref<string | null>(null);
  function saveToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }
  return {
    token,
    saveToken
  };
});
