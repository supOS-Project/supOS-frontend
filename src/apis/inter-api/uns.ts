import { ApiWrapper, CustomAxiosConfigEnum } from '@/utils/request';

const baseUrl = '/inter-api/supos/uns';

const api = new ApiWrapper(baseUrl);

export const searchTreeData = async (params?: Record<string, unknown>) => api.get('/search', { params }); // 获取所以树数据
export const getTreeData = async (params?: Record<string, unknown>) => api.get('/tree', { params }); // 获取所以树数据
export const getTypes = async (params?: Record<string, unknown>) => api.get('/types', { params }); // 获取数据类型
export const getLastMsg = async (params?: Record<string, unknown>) => api.get('/getLastMsg', { params }); // 获取最新msg
export const addModel = async (data: any) => api.post('/model', data); // 新增model
export const detectModel = async (data: any) => api.post('/model/detect', data); // 校验model
export const editModel = async (data: any) => api.put('/model', data); // 修改model
export const getModelInfo = async (params?: Record<string, unknown>) => api.get('/model', { params, _noMessage: true }); // 查询模型字段声明
export const getInstanceInfo = async (params?: Record<string, unknown>) =>
  api.get('/instance', { params, _noMessage: true }); // 查询模型字段声明
export const deleteTreeNode = async (params?: Record<string, unknown>) => api.delete('', { params }); // 删除树节点
export const getDashboardList = async (params?: Record<string, unknown>) =>
  api.get('/dashboard', {
    params,
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  }); // 获取dashboard
export const addDashboard = async (data: any) => api.post('/dashboard', data); // 新增dashboard
export const editDashboard = async (data: any) => api.put('/dashboard', data); // 编辑dashboard
export const deleteDashboard = async (uid: string) => api.delete(`/dashboard/${uid}`); // 删除dashboard
export const importExcel = async (data: any) =>
  api.upload(`/excel/template/import`, data, {
    method: 'post',
  }); //导入excel
export const exportExcel = async (data: any) => api.post('/excel/data/export', data); //导出excel
export const searchRestField = async (data: any) => api.post('/searchRestField', data); // 从RestApi搜系模型字段
export const getDashboardDetail = async (id: any) => api.get(`/dashboard/${id}`); // 获取dashboard详情

// 报警列表页
export const getAlertList = async (params?: Record<string, unknown>) =>
  api
    .get('/search', {
      params,
      [CustomAxiosConfigEnum.BusinessResponse]: true,
    })
    .then((data: any) => {
      return {
        ...data,
        pageNo: data?.page?.pageNo,
        pageSize: data?.page?.pageSize,
        total: data?.page?.total,
      };
    });

// 报警列表 options使用
export const getAlertForSelect = async (params?: Record<string, unknown>) =>
  api
    .get('/search', {
      params,
    })
    .then((data: any) => {
      return data?.map?.((item: any) => ({
        label: item.name,
        value: item.id,
      }));
    });

// 轮询获取拓扑图状态
export const getTopologyStatus = async (params?: Record<string, unknown>) =>
  api.get('/topology', { params, [CustomAxiosConfigEnum.NoMessage]: true });
export const getAllLabel = async (params?: Record<string, unknown>) => api.get('/allLabel', { params }); // 获取所有标签
export const addLabel = async (name?: Record<string, unknown>) =>
  api.post(`/label?name=${name ? encodeURIComponent(String(name)) : ''}`); // 获取所有标签
export const deleteLabel = async (id: string | number) =>
  api.delete(`/label?id=${id}`, {
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  }); // 删除标签
export const getAllTemplate = async (data: any) => api.post('/template/pageList', data); // 获取所有模板
export const getTemplateDetail = async (params: any) => api.get('/template', { params }); // 获取模板详情
export const addTemplate = async (data: any) => api.post('/template', data); // 新增模板
export const makeLabel = async (unsId: string, data: any) => api.post(`/makeLabel?unsId=${unsId}`, data); // 新增model
export const deleteTemplate = async (id: string | number) => api.delete(`/template?id=${id}`); // 删除模板
export const editTemplateName = async (params: any) =>
  api.put(`/template`, null, {
    params,
  }); // 删除模板

// 标签
export const getLabelDetail = async (id: string) => api.get(`/label/detail?id=${id}`); // 获取标签详情
export const getLabelPath = async () => api.get(`/search?type=2`); // 获取path
export const updateLabel = async (data: any) =>
  api.put('/label', data, {
    [CustomAxiosConfigEnum.BusinessResponse]: true,
  }); // 修改标签
export const getLabelUnsId = async (path: any) => api.get(`/instance?id=${path}`); // 获取标签详情
export const verifyFileName = async (params: any) => api.get(`/name/duplication`, { params }); // 检验文件夹文件重名
export const triggerRestApi = async (params: any) => api.post('/triggerRestApi', {}, { params }); // 主档触发restapi
export const ds2fs = async (data: any) => api.post('/ds2fs', data); // 外部数据源转uns接口
export const json2fs = async (data: any) => api.post('/json2fs', data); // JSON 转 UNS 接口
export const json2fsTree = async (data: any) => api.post('/json2fs/tree', data); // JSON 转 UNSTree 接口
export const batchReverser = async (data: any) =>
  api.post('/batch', data, {
    [CustomAxiosConfigEnum.BusinessResponse]: true,
    [CustomAxiosConfigEnum.NoMessage]: true,
  }); // 批量提交topic

export const modifyModel = async (data: any) => api.put('/name', data); // 修改文件夹或文件
export const modifyDetail = async (data: any) => api.put('/detail', data); // 修改文件夹或文件详情

export const getUnsLazyTree = async (
  data: { parentId?: string; keyword?: string; pageNo: number; pageSize: number },
  config?: any
) => api.post('/condition/tree', data, config);

export const pageListUnsByTemplate = async (params: any) =>
  api.get(`/label/pageListUnsByTemplate`, { params, [CustomAxiosConfigEnum.BusinessResponse]: true }); // 模版关联文件夹文件
export const pageListUnsByLabel = async (params: any) =>
  api.get(`/label/pageListUnsByLabel`, { params, [CustomAxiosConfigEnum.BusinessResponse]: true }); // 标签关联文件夹文件

export const cancelLabel = async (id: string, data: any) => api.delete(`/cancelLabel?unsId=${id}`, {}, data); // 删除标签关联的文件

export const makeSingleLabel = async (unsId: string, labelId: string) =>
  api.post(`/makeSingleLabel?unsId=${unsId}&labelId=${labelId}`); // 增加标签关联的文件
