import Request from './index';
import { AxiosResponse } from 'axios';
import appStore from '@/store';
const http = new Request({
  timeout: 1000 * 60 * 5,
  interceptors: {
    // 请求拦截器
    requestInterceptors: (config) => {
      config.validateStatus = (status) => {
        switch (status) {
          case 401:
            console.warn('Suppressing 401 ElMessage in custom.ts due to guest access.');
          // ElMessage.error('用户信息过期或无权限，请重新登录');
          // const { saveToken } = appStore.useTokenStore;
          // ...
          default:
            break;
        }
        return status >= 200 && status < 400;
      };
      return config;
    },
    // 响应拦截器
    responseInterceptors: (result: AxiosResponse) => {
      return result;
    }
  }
});
export default http;
