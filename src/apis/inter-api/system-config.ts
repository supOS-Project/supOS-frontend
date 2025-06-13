import { ApiWrapper } from '@/utils/request';

const baseUrl = '/inter-api/supos';

const api = new ApiWrapper(baseUrl);

// 系统配置
export const getSystemConfig = async () => api.get('/systemConfig');
