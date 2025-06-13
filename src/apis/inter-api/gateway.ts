import { ApiWrapper, CustomAxiosConfigEnum } from '@/utils/request';

const baseUrl = '/inter-api/supos';

const api = new ApiWrapper(baseUrl);

// 新增采集器网关
export const addGateway = async (data?: Record<string, unknown>) => api.post('/collector-gateway', data);

// 采集器网关配置详情
export const gatewayDetail = async (params?: Record<string, unknown>) => api.get('/collector-gateway', params);

// 删除采集器网关
export const deleteGateway = async (id: any) => api.delete(`/collector-gateway/${id}`);

// 修改采集器网关
export const updateGateway = async (data?: Record<string, unknown>) => api.put(`/collector-gateway`, data);

export const getGatewayPageList = async (data?: Record<string, unknown>) =>
  api.post('/collector-gateway/pageList', data, {
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  });

// 采集器网关列表
export const getGatewayList = async (params?: Record<string, unknown>) => api.get('/collector-gateway', params);

// 设备
export const getGatewayEndpointList = async (params?: Record<string, unknown>) =>
  api.get(`/collector-gateway/endpoint?authUuid=${params?.authUuid}`, {
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  });

// 位号
export const getMeasurementPointNumberList = async (data?: Record<string, unknown>) =>
  api.post(`/collector-gateway/meta/tag/pageList`, data, {
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  });
