import { ApiWrapper, CustomAxiosConfigEnum } from '@/utils';

export const baseUrl = '/inter-api/supos/process';

const api = new ApiWrapper(baseUrl);

export const getProcessList = async (params?: Record<string, unknown>) =>
  api.post('/definition/pageList', {
    params: {
      k: params?.k,
      pageNo: params?.page,
      pageSize: params?.pageSize,
    },
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  }); // 获取工作流列表
export const addProcess = async (params?: Record<string, unknown>) => api.post('/definition/pageList', { params }); // 新增或编辑工作流
export const deleteProcess = async (params?: Record<string, unknown>) => api.delete('/definition/pageList', { params }); // 删除工作流
export const startProcess = async (params?: Record<string, unknown>) => api.post('/definition/pageList', { params }); // 启动工作流
export const suspendProcess = async (params?: Record<string, unknown>) => api.post('/definition/pageList', { params }); // 暂停工作流
