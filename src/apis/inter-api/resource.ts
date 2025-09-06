import { ApiWrapper } from '@/utils/request';

const baseUrl = '/inter-api/supos/resource';

const api = new ApiWrapper(baseUrl);

// 获取路由资源
export const getRoutesResourceApi = async (params?: { groupType?: number }) => api.get('', { params });
