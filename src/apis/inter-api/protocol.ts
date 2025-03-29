import { ApiWrapper } from '@/utils';

export const baseUrl = '/inter-api/supos';

const api = new ApiWrapper(baseUrl);

export const getServerList = async (params?: Record<string, unknown>) => api.get('/protocol/servers', { params }); // 获取服务列表
export const addServer = async (data: any) => api.post('/protocol/server', data); // 新增服务
export const deleteServer = async (id: any, params?: Record<string, unknown>) =>
  api.delete(`/protocol/server/${id}`, { params }); // 删除服务
export const getProtocolList = async (params?: Record<string, unknown>) => api.get('/protocols', { params }); // 获取协议列表
export const formatProtocol = async (data: any) => api.post('/protocol/format', data); // 导入协议JSON
export const addProtocol = async (data: any) => api.post('/protocol', data); // 新增协议
export const getProtocolDetail = async (name: any) => api.get(`/protocol/${name}`); // 获取协议详情
export const deleteProtocol = async (name: any) => api.delete(`/protocol/${name}`); // 删除协议
export const getProtocolTags = async (data: any, config: any = {}) => api.post('/protocol/tags', data, config); // 根据协议参数查询位号列表
