import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useMatchRoute } from '@/hooks';
import { Location } from 'react-router-dom';
import { compareLocations } from '@/utils';
import { useLocationNavigate } from '@/routers';

export interface KeepAliveTab {
  title: ReactNode;
  routePath: string;
  key: string;
  pathname: string;
  icon?: any;
  children: any;
  location: Location;
}

function getKey() {
  return new Date().getTime().toString();
}

export function useTabs() {
  const navigate = useLocationNavigate();
  // 存放页面记录
  const [keepAliveTabs, setKeepAliveTabs] = useState<KeepAliveTab[]>([]);
  // 当前激活的tab
  const [activeTabRoutePath, setActiveTabRoutePath] = useState<string>('');

  const matchRoute = useMatchRoute();

  useEffect(() => {
    if (!matchRoute) return;
    const existKeepAliveTab = keepAliveTabs.find((o) => o.routePath === matchRoute?.routePath);
    // 如果不存在则需要插入
    if (!existKeepAliveTab) {
      setKeepAliveTabs((prev) => [
        ...prev,
        {
          ...matchRoute,
          key: getKey(),
        },
      ]);
    } else if (!existKeepAliveTab.children) {
      // 如果pathname相同，但是children为空，说明重缓存中加载的数据，我们只需要刷新当前页签并且把children设置为新的children
      setKeepAliveTabs((prev) => {
        const index = (prev || []).findIndex((tab) => tab.routePath === matchRoute.routePath);
        if (index >= 0 && prev) {
          prev[index].key = getKey();
          prev[index].children = matchRoute.children;
        }
        return [...(prev || [])];
      });
    } else if (existKeepAliveTab && !compareLocations(matchRoute.location, existKeepAliveTab.location, ['key'])) {
      // 处理location
      setKeepAliveTabs((prev) => {
        const index = (prev || []).findIndex((tab) => tab.routePath === matchRoute.routePath);
        if (index >= 0 && prev) {
          prev[index].location = matchRoute.location;
        }
        return [...(prev || [])];
      });
    }
    setActiveTabRoutePath(matchRoute.routePath);
  }, [matchRoute]);

  // 关闭tab
  const onCloseTab = useCallback(
    (routePath: string = activeTabRoutePath || '') => {
      if (!keepAliveTabs?.length) {
        return;
      }
      const index = (keepAliveTabs || []).findIndex((o) => o.routePath === routePath);
      if (keepAliveTabs[index].routePath === activeTabRoutePath && keepAliveTabs.length > 1) {
        if (index > 0) {
          const { location } = keepAliveTabs[index - 1];
          navigate(location);
        } else {
          const { location } = keepAliveTabs[index + 1];
          navigate(location);
        }
      }
      keepAliveTabs.splice(index, 1);
      setKeepAliveTabs([...keepAliveTabs]);
    },
    [activeTabRoutePath]
  );

  // 刷新tab
  const onRefreshTab = useCallback(
    (routePath: string = activeTabRoutePath || '') => {
      setKeepAliveTabs((prev) => {
        const index = (prev || []).findIndex((tab) => tab.routePath === routePath);
        if (index >= 0 && prev) {
          prev[index].key = getKey();
        }
        return [...(prev || [])];
      });
    },
    [activeTabRoutePath]
  );

  // 关闭除了自己其它tab
  const onCloseOtherTab = useCallback(
    (routePath: string = activeTabRoutePath || '') => {
      if (!keepAliveTabs?.length) {
        return;
      }
      const tab = keepAliveTabs.find((o) => o.routePath === routePath);
      const toCloseTabs = keepAliveTabs.filter((o) => o.routePath === routePath);

      setKeepAliveTabs(toCloseTabs);
      const { location } = tab || {};
      if (location) {
        navigate(location);
      } else {
        navigate({ pathname: tab?.pathname || routePath });
      }
    },
    [activeTabRoutePath]
  );

  return {
    tabs: keepAliveTabs,
    setTabs: setKeepAliveTabs,
    activeTabRoutePath,
    onCloseTab,
    onRefreshTab,
    onCloseOtherTab,
  };
}
