import { ApiWrapper } from '@/utils/request';

export const baseUrl = '/hasura/home/v1/graphql';

const api = new ApiWrapper(baseUrl);

export const searchGraphql = async (data?: any) => api.post('', data, { _noCode: true }); // 获取所以树数据
