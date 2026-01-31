import { defineStore } from 'pinia';

// 用户信息
export const useUserInfoStore = defineStore('userInfoStore', () => {
  const userInfo = ref<any>({
    _id: 'guest_user',
    name: '访客用户',
    email: 'guest@example.com',
    isAllFree: true,
    roles: ['User'],
    auth: {
      email: { valid: true }
    },
    photos: {
      profilePic: { url: '' }
    }
  });

  const saveUserInfo = (newUserInfo: any) => {
    userInfo.value = newUserInfo;
  };
  const saveIntegralInfo = () => {};
  async function getAndUpdateUserInfo() {}
  async function getUserIntegralTotal() {}

  return {
    userInfo,
    saveUserInfo,
    saveIntegralInfo,
    getAndUpdateUserInfo,
    getUserIntegralTotal
  };
});
