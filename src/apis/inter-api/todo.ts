import { ApiWrapper, CustomAxiosConfigEnum } from '@/utils';

const baseUrl = '/inter-api/supos';

const api = new ApiWrapper(baseUrl);

// 获取系统模块列表
export const getModuleList = async (params?: Record<string, unknown>) =>
  api.get('/systemConfig/moduleList', { params });
// 待办已办列表
export const todoPageList = async (data: any) =>
  api.post(
    '/todo/pageList',
    {
      ...data,
      pageNo: data?.page,
      pageSize: data?.pageSize,
      status: data?.status || 0,
    },
    {
      [CustomAxiosConfigEnum.BusinessResponse]: true,
    }
  );
