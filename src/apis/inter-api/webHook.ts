import { ApiWrapper } from '@/utils/request';

const baseUrl = '/inter-api/supos';
const api = new ApiWrapper(baseUrl);

//webHook 列表
export const getWebHookList = async (params?: Record<string, unknown>) =>
  api.get('/webhooks', {
    params,
  });

// 新增

export const addWebHookList = async (data?: Record<string, unknown>) => api.post('/webhooks', data);

//修改
export const updateWebHookList = async (data?: Record<string, unknown>) => api.put('/webhooks', data);

//删除
export const deleteWebHookList = async (id: any) => api.delete(`/webhooks/${id}`);
