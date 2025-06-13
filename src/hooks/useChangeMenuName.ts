import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { childrenRoutes } from '@/routers';
import { useTranslate } from '@/hooks/index.ts';
import { setCurrentMenuInfo, useBaseStore } from '@/stores/base';

// 改变menu的名称
const useChangeMenuName = () => {
  const { pathname } = useLocation();
  const formatMessage = useTranslate();
  const pickedRoutesOptions = useBaseStore((state) => state.pickedRoutesOptions);

  useEffect(() => {
    // 监听location修改名称
    const pathName = pathname?.slice(1);
    const info = pickedRoutesOptions?.find((f) => {
      if (f.isFrontend) {
        return f?.menu?.url === pathname;
      } else {
        return f.key === pathName;
      }
    });
    if (info) {
      if (info?.isRemoteChildMenu) {
        setCurrentMenuInfo({
          ...info,
          name: formatMessage(`${info?.parentKey}.${info?.childrenMenuKey}PageName`),
          showName: formatMessage(`${info?.parentKey}.${info?.childrenMenuKey}PageName`),
        });
      } else {
        setCurrentMenuInfo(info);
      }
    } else {
      // 内置路由情况
      const interInfo = childrenRoutes?.find((f) => f.path === pathname);
      const parentInfo = pickedRoutesOptions?.find((f) => {
        return f?.menu?.url === interInfo?.handle?.parentPath;
      }) || { name: '未配置', showName: '未配置' };
      if (interInfo && (parentInfo || interInfo?.handle?.parentPath === '/_common')) {
        setCurrentMenuInfo({
          ...parentInfo,
          name:
            (interInfo?.handle?.menuNameKey
              ? formatMessage((interInfo?.handle as any)?.menuNameKey)
              : (interInfo?.handle as any)?.name) || parentInfo?.name,
          showName:
            (interInfo?.handle?.menuNameKey
              ? formatMessage((interInfo?.handle as any)?.menuNameKey)
              : (interInfo?.handle as any)?.name) || parentInfo?.showName,
        });
      }
    }
  }, [pathname, pickedRoutesOptions]);
};

export default useChangeMenuName;
