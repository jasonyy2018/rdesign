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
  // 用户简币
  const userIntegralInfo = ref<any>({
    integralTotal: 999999,
    isattendance: true
  });

  // 改为不传递参数
  const saveUserInfo = () => {
    // userInfo.value = userInfoObj;
  };
  const saveIntegralInfo = () => {
    // userIntegral.value = integalInfo;
  };

  // 查询用户信息
  async function getAndUpdateUserInfo() {
    console.log('User mock active, skipping fetch');
  }

  // 查询用户当前用户简币信息
  async function getUserIntegralTotal() {
    console.log('User mock active, skipping fetch');
  }
  return {
    userInfo,
    userIntegralInfo,
    saveUserInfo,
    saveIntegralInfo,
    getAndUpdateUserInfo,
    getUserIntegralTotal
  };
});
