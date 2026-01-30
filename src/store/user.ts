import { getUserIntegralTotalAsync } from '@/http/api/integral';
import { getUserInfoAsync } from '@/http/api/user';
import { defineStore } from 'pinia';
import appStore from './index';

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

  function saveUserInfo(userInfoObj: any) {
    console.log('User mock active, skipping save');
  }

  function saveIntegralInfo(integalInfo: any) {
    console.log('Integral mock active, skipping save');
  }

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
