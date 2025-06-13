import { ApiWrapper } from '@/utils/request';

const baseUrl = '/inter-api/supos/sys';

const api = new ApiWrapper(baseUrl);

// 获取模块列表
export const queryModuleList = async (params?: any) => api.get('/modules', { params });

// 删除模块
export const deleteModule = async (moduleCode: string) => api.delete(`/modules/${moduleCode}`);

// 获取编码列表
export const queryCodeList = async (params: any) => api.get('/entities', { params });

// 新增编码
export const addCode = async (params: any) => api.post('/entities', params);

// 修改编码
export const updateCode = async (params: any) => api.put('/entities', params);

// 删除编码
export const deleteCode = async (params: any) => api.delete('/entities', { data: params });

// 获取编码值列表
export const queryCodeValues = async (params: any) => api.get('/codes', { params });

// 新增编码值
export const addCodeValue = async (params: any) => api.post('/codes', params);

// 修改编码值
export const updateCodeValue = async (params: any) => api.put('/codes', params);

// 删除编码值
export const deleteCodeValue = async (params: any) => api.delete('/codes', { data: params });

// 批量删除编码值
export const batchDeleteCodeValue = async (params: any) => api.delete('/codes/batch', { data: params });

// 排序编码值
export const sortCodeValue = async (params: any) => api.put('/codes/sort', params);
