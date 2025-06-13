import { useEffect, useMemo } from 'react';
import { App as AntApp } from 'antd';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from '@/routers';
import DynamicIframe from '@/pages/dynamic-iframe';
import CookieContext from '@/CookieContext';
import themeToken from './theme/theme-token.ts';
import 'shepherd.js/dist/css/shepherd.css';
import './App.css';
import { userLogin } from '@/apis/chat2db';
import { UnsTreeMapProvider } from '@/UnsTreeMapContext';
import { MENU_TARGET_PATH, STORAGE_PATH } from '@/common-types/constans.ts';
import LanguageProvider from './LanguageProvider.tsx';
import { queryChat2dbCurUser } from '@/utils/chat2db.ts';
import { checkImageExists, getBaseUrl } from '@/utils/url-util.ts';
import DynamicMFComponent from '@/components/dynamic-mf-component';
import { fetchBaseStore, useBaseStore } from '@/stores/base';
import { setThemeBySystem, ThemeType, useThemeStore } from '@/stores/theme-store.ts';
import { cleanupI18nSubscriptions, getIntl } from './stores/i18n-store.ts';

function App() {
  const { currentUserInfo, systemInfo, pickedRoutesOptions, loading, routesStatus } = useBaseStore((state) => ({
    currentUserInfo: state.currentUserInfo,
    systemInfo: state.systemInfo,
    pickedRoutesOptions: state.pickedRoutesOptions,
    loading: state.loading,
    routesStatus: state.routesStatus,
  }));
  const _theme = useThemeStore((state) => state._theme);

  useEffect(() => {
    // 初始化
    fetchBaseStore(true);
    return () => {
      cleanupI18nSubscriptions();
    };
  }, []);

  const router: any = useMemo(() => {
    return routes.map((route, index) => {
      if (index === 1 && route.children) {
        return {
          ...route,
          children: [
            // 前端路由
            ...((route.children ?? [])
              ?.map((child) => {
                const info = pickedRoutesOptions?.find((f) => child.path === f?.menu?.url);
                if (info) {
                  return {
                    ...child,
                    handle: {
                      ...child.handle,
                      path: child.path,
                      name: info?.name,
                      icon: info?.iconUrl,
                    },
                  };
                } else if (child.handle?.parentPath === '/_common') {
                  // 开发环境打开方便调试
                  if (import.meta.env.DEV) return child;
                  if (child.handle?.type === 'all') {
                    return child;
                  }
                  // 没有正真父级菜单情况
                  if (
                    systemInfo?.authEnable &&
                    !currentUserInfo?.pageList?.some((s: any) => s.uri?.toLowerCase?.() === child.path?.toLowerCase?.())
                  ) {
                    return null;
                  }
                  return {
                    ...child,
                    handle: {
                      ...child.handle,
                      path: child.path,
                      name: child.handle?.name ?? child.path,
                    },
                  };
                } else if (child.handle?.parentPath) {
                  // 没有暴露出去的路由
                  return {
                    ...child,
                    handle: {
                      ...child.handle,
                      path: child.path,
                      name: child.handle?.name ?? child.path,
                    },
                  };
                } else {
                  // 开发环境打开方便调试
                  if (import.meta.env.DEV) return child;
                  return null;
                }
              })
              ?.filter((f) => f) || []),
            // 后端路由（及前端模块联邦路由）
            ...(pickedRoutesOptions
              ?.filter((item) => !item.isFrontend)
              ?.map((d) => {
                // 模块联邦 子路由
                if (d.isRemoteChildMenu) {
                  return {
                    path: '/' + d?.key,
                    Component: DynamicMFComponent,
                    handle: {
                      parentPath: '/' + d?.parentKey,
                      name: getIntl(`${d?.parentKey}.${d?.childrenMenuKey}PageName`),
                      menuNameKey: `${d?.parentKey}.${d?.childrenMenuKey}PageName`,
                      key: d?.key,
                      path: '/' + d?.key,
                      moduleName: d?.childrenMenuKey,
                    },
                  };
                }
                // 模块联邦
                if (d.isRemote === '1') {
                  return {
                    path: '/' + d?.key,
                    Component: DynamicMFComponent,
                    handle: {
                      key: d?.key,
                      name: d?.name,
                      icon: d?.iconUrl,
                      path: '/' + d?.key,
                    },
                  };
                }
                if (!d) return null;
                let iframeRealUrl;
                if (d.openType !== undefined) {
                  if (d.openType === '0') {
                    const { port, protocol, host, name } = d.service as any;
                    const path = d.menu?.url?.split(name)?.[1] || '';
                    iframeRealUrl = port ? `${protocol}://${host}:${port}${path}` : `${protocol}://${host}${path}`;
                  } else {
                    iframeRealUrl =
                      d?.menuProtocol && d?.menuHost && d?.menuPort
                        ? `${d?.menuProtocol}://${d?.menuHost}:${d?.menuPort}${d?.menu?.url}`
                        : undefined;
                  }
                }
                return {
                  path: '/' + d?.key,
                  element: <DynamicIframe url={d?.menu?.url} name={d?.name} iframeRealUrl={iframeRealUrl} />,
                  handle: {
                    openType: d?.openType,
                    key: d?.key,
                    name: d?.name,
                    icon: d?.iconUrl,
                    path: '/' + d?.key,
                  },
                };
              })
              ?.filter((f) => f) || []),
          ],
        };
      } else {
        return route;
      }
    });
  }, [pickedRoutesOptions]);
  const browserRouter = createBrowserRouter(router);

  useEffect(() => {
    if (systemInfo?.containerMap?.chat2db) {
      // chat2db登录逻辑
      try {
        queryChat2dbCurUser?.()?.then(async (res) => {
          if (!res) {
            // 重新登录
            await userLogin?.();
            await queryChat2dbCurUser?.();
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, [systemInfo?.containerMap]);

  useEffect(() => {
    const loadFavicon = async () => {
      const baseUrl = `${getBaseUrl()}${STORAGE_PATH}${MENU_TARGET_PATH}/logo-ico.svg`;
      const themeExists = await checkImageExists(baseUrl);

      // 统一处理文件类型和路径
      const [type, path] = themeExists ? ['image/svg+xml', baseUrl] : ['image/svg+xml', '/logo.svg'];

      // 统一处理时间戳
      const href = `${path}?v=${Date.now()}`;

      // 查找或创建 link 元素
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.append(link);
      }

      // 统一设置属性
      Object.assign(link, { type, href });
    };

    loadFavicon();
  }, []);

  useEffect(() => {
    if (_theme === ThemeType.System) {
      const mediaChange = (event: any) => {
        setThemeBySystem(event.matches);
      };
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', mediaChange);
      return () => {
        mediaQuery.removeEventListener('change', mediaChange);
      };
    }
  }, [_theme]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (routesStatus === 401) {
    return <div></div>;
  }

  return (
    <>
      <CookieContext />
      <LanguageProvider config={{ theme: themeToken }}>
        {/*antd组件库的主题*/}
        <UnsTreeMapProvider>
          <AntApp>
            <RouterProvider router={browserRouter} />
          </AntApp>
        </UnsTreeMapProvider>
      </LanguageProvider>
    </>
  );
}

export default App;
