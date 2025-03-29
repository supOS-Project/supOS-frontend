import { ApiWrapper, CustomAxiosConfigEnum } from '@/utils';

const baseUrl = '/inter-api/supos/userManage';

const api = new ApiWrapper(baseUrl);

// 获取用户信息
export const getUserManageList = async (data?: Record<string, unknown>) =>
  api.post(
    '/pageList',
    {
      pageNo: data?.page,
      pageSize: data?.pageSize,
    },
    {
      [CustomAxiosConfigEnum.BusinessResponse]: true,
    }
  );

// 更新用户
export const updateUser = async (data?: Record<string, unknown>) => api.put('/updateUser', data);

// 删除用户
export const deleteUser = async (id: string) => api.delete(`/deleteById/${id}`);

// 重置密码
export const resetPwd = async (data?: Record<string, unknown>) => api.put('/resetPwd', data);
// 用户重置密码
export const userResetPwd = async (data?: Record<string, unknown>) => api.put('/userResetPwd', data);

// 更新用户tips开关启用状态
export const updateTipsEnable = async (enable: number, data?: Record<string, unknown>) =>
  api.put(`/tipsEnable?tipsEnable=${enable}`, data);

// 创建用户
export const createUser = async (data?: Record<string, unknown>) => api.post('/createUser', data);

// 获取角色列表
export const getRoleList = async () => api.get('/roleList');
