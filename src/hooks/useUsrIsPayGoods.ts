/**
 * @description 返回用户是否支付该资源
 */
export const useUserIsPayGoods = async (id: any) => {
  return new Promise((resolve) => {
    console.log('useUserIsPayGoods mock active for id:', id);
    resolve(true);
  });
};
