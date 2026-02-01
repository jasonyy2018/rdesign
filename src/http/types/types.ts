import type { AxiosRequestConfig, AxiosResponse } from 'axios';
export interface RequestInterceptors<T> {
  requestInterceptors?: (config: any) => any;
  requestInterceptorsCatch?: (err: any) => any;
  responseInterceptors?: (config: T) => T;
  responseInterceptorsCatch?: (err: any) => any;
}
export interface RequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: RequestInterceptors<T>;
}
export interface CancelRequestSource {
  [index: string]: () => void;
}
