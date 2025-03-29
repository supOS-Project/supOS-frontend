import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoutesContext } from '@/contexts/routes-context';
import { childrenRoutes } from '@/routers';

// 改变menu的名称
const useChangeMenuName = () => {
  const routesStore = useRoutesContext();
  const { pathname } = useLocation();

  useEffect(() => {
    // 监听location修改名称
    const pathName = pathname?.slice(1);
    const info = routesStore.pickedRoutesOptions?.find((f) => {
      if (f.isFrontend) {
        return f?.menu?.url === pathname;
      } else {
        return f.key === pathName;
      }
    });
    if (info) {
      routesStore.setCurrentMenuInfo(info);
    } else {
      // 内置路由情况
      const interInfo = childrenRoutes?.find((f) => f.path === pathname);
      const parentInfo = routesStore.pickedRoutesOptions?.find((f) => {
        return f?.menu?.url === interInfo?.handle?.parentPath;
      }) || { name: '未配置', showName: '未配置' };
      if (interInfo && (parentInfo || interInfo?.handle?.parentPath === '/_common')) {
        routesStore.setCurrentMenuInfo({
          ...parentInfo,
          name: interInfo?.handle?.name || parentInfo?.name,
          showName: interInfo?.handle?.name || parentInfo?.showName,
        });
      }
    }
  }, [pathname, JSON.stringify(routesStore.pickedRoutesOptions)]);
};

export default useChangeMenuName;
