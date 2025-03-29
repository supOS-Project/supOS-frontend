import { ApiWrapper } from '@/utils';

const baseUrl = '/inter-api/supos/kong';

const api = new ApiWrapper(baseUrl);

// 获取所有路由
export const getRoutes = async (params?: Record<string, unknown>) => api.get('/user/routes', { params });
// 更新勾选的路由
export const postPickRoutes = async (data: any) => api.post('/user/routes/mark', data);
