import { defineStore } from 'pinia';

// 用户信息
export const useMembershipStore = defineStore('membershipStore', () => {
  const membershipInfo = ref<any>({
    hasMembership: true,
    isExpired: false,
    daysRemaining: 9999,
    type: 'lifetime',
    membershipName: '永久会员',
    expiredDays: 0
  });

  // 保存用户会员信息
  function saveMembershipInfo(membershipInfoObj: any) {
    console.log('Membership mock active, skipping save:', membershipInfoObj);
  }

  // 查询用户信息
  async function getUserMembershipInfo() {
    console.log('Membership mock active, skipping fetch');
  }

  return {
    membershipInfo,
    getUserMembershipInfo,
    saveMembershipInfo
  };
});
