import { ApiWrapper, CustomAxiosConfigEnum } from '@/utils';

export const baseUrl = '/inter-api/supos/uns';

const api = new ApiWrapper(baseUrl);

export const getStreamList = async (params?: Record<string, unknown>) =>
  api.get('/stream', {
    params: {
      pageNo: params?.page,
      pageSize: params?.pageSize,
    },
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  });
export const addStream = async (data: any) => api.post('/stream', data);
export const deleteStream = async (namespace: string) => api.delete(`/stream/`, { params: { namespace } });
export const resumeStream = async (namespace: string) => api.put(`/stream/resume`, {}, { params: { namespace } });
export const stopStream = async (namespace: string) => api.put(`/stream/stop/`, {}, { params: { namespace } });
