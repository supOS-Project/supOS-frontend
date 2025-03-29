import { useCallback, useEffect, useRef, useState } from 'react';
interface UsePaginationParams {
  initPageSize?: number; // 每页大小，默认为10
  initPageSizes?: number[];
  initPage?: number; // 初始页码，默认为1
  fetchApi: any; // API 函数，返回数据及总数
  // 简单的pagination的page是从0开始
  simple?: boolean;
  // 默认参数
  defaultParams?: any;
  // 首次是否请求
  firstNotGetData?: boolean;
  isAntdPagination?: boolean;
  onSuccessCallback?: (data: any) => void;
}

const usePagination = <T>({
  initPageSize = 19,
  initPage = 1,
  initPageSizes = [10, 20, 30, 50, 100],
  fetchApi,
  defaultParams = {},
  simple = true,
  firstNotGetData,
  isAntdPagination,
  onSuccessCallback,
}: UsePaginationParams) => {
  const firstUpdate = useRef(firstNotGetData === true);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const totalRef = useRef(0);
  const [paramsData, setParamsData] = useState({
    pageSize: initPageSize,
    page: initPage,
    searchFormData: {},
  });
  const getData = () => {
    setLoading(true);
    fetchApi({ ...defaultParams, ...paramsData.searchFormData, pageSize: paramsData.pageSize, page: paramsData.page })
      .then((data: any) => {
        setData(data?.data);
        totalRef.current = data?.total ?? 0;
        if (onSuccessCallback) {
          onSuccessCallback?.(data);
        }
        const page = data?.pageNo ?? 1;
        if (paramsData.page !== page) {
          setParamsData((o) => ({ ...o, page }));
        }
        if (data?.data?.length === 0 && data?.pageNo > 1) {
          setParamsData((o) => ({ ...o, page: data?.pageNo - 1 }));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    getData();
  }, [paramsData]);

  const onPageChange = useCallback((page: number | { page: number; pageSize: number }) => {
    if (typeof page === 'number') {
      setParamsData((o) => ({
        ...o,
        page: isAntdPagination ? (page !== 0 ? page : page + 1) : page + 1,
      }));
    } else {
      setParamsData((o) => ({
        ...o,
        page: page.page,
        pageSize: page.pageSize,
      }));
    }
  }, []);

  const reload = useCallback(() => {
    setParamsData((o) => ({
      ...o,
      page: 1, // 重置页数为 1
    }));
  }, []);

  // 参数请求
  const setSearchParams = useCallback((value: any) => {
    setParamsData((o) => ({
      ...o,
      page: 1, // 重置页数为 1
      searchFormData: value || {},
    }));
  }, []);

  return {
    setLoading,
    loading,
    data,
    reload,
    refreshRequest: getData,
    pagination: {
      // 总共多少个操作数字
      totalItems: simple ? Math.ceil(totalRef.current / paramsData.pageSize) : totalRef.current,
      // 当前页
      page: simple ? paramsData.page - 1 : paramsData.page,
      pageSize: paramsData.pageSize,
      pageSizes: initPageSizes,
      onChange: onPageChange,
      total: totalRef.current,
    },
    setSearchParams,
  };
};

export default usePagination;
