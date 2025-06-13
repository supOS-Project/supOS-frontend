import { ApiWrapper } from '@/utils/request';

const baseUrl = '/inter-api/supos/external';

const api = new ApiWrapper(baseUrl);

export const getExternalTreeData = async (params?: Record<string, unknown>) => api.get('/tree', { params });
