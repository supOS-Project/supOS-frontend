import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useRoutesContext } from '@/contexts/routes-context';
import { ConfigProvider, App as AntApp } from 'antd';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from '@/routers';
import DynamicIframe from '@/pages/dynamic-iframe';
import { useThemeContext } from '@/contexts/theme-context';
import { Theme } from '@carbon/react';
import { IntlProvider } from 'react-intl';
import I18nStore from '@/stores/i18n-store';
import CookieContext from '@/CookieContext';
import themeToken from './theme/theme-token.ts';
import 'shepherd.js/dist/css/shepherd.css';
import './App.css';
import { ThemeTypeEnum } from '@/stores/theme-store.ts';
import { checkImageExists, getBaseUrl, queryChat2dbCurUser } from '@/utils';
import { userLogin } from '@/apis/chat2db';
import { UnsTreeMapProvider } from '@/UnsTreeMapContext';
import { MENU_TARGET_PATH, STORAGE_PATH } from '@/common-types/constans.ts';

function App() {
  const routesStore = useRoutesContext();
  const themeStore = useThemeContext();

  const router: any = useMemo(() => {
    return routes.map((route, index) => {
      if (index === 1 && route.children) {
        return {
          ...route,
          children: [
            // 前端路由
            ...((route.children ?? [])
              ?.map((child) => {
                const info = routesStore?.pickedRoutesOptions?.find((f) => child.path === f?.menu?.url);
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
                  // 没有正真父级菜单情况
                  if (
                    routesStore.systemInfo?.authEnable &&
                    !routesStore.currentUserInfo?.pageList?.some(
                      (s: any) => s.uri?.toLowerCase?.() === child.path?.toLowerCase?.()
                    )
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
            // 后端路由
            ...(routesStore?.pickedRoutesOptions
              ?.filter((item) => !item.isFrontend)
              ?.map((d) => {
                if (!d) return null;
                return {
                  path: '/' + d?.key,
                  element: (
                    <DynamicIframe
                      url={d?.menu?.url}
                      name={d?.name}
                      iframeRealUrl={
                        d?.menuProtocol && d?.menuHost && d?.menuPort
                          ? `${d?.menuProtocol}://${d?.menuHost}:${d?.menuPort}`
                          : ''
                      }
                    />
                  ),
                  handle: {
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
  }, [routesStore?.pickedRoutesOptions]);

  const browserRouter = createBrowserRouter(router);

  useEffect(() => {
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
  }, []);

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
    if (themeStore._theme === ThemeTypeEnum.System) {
      const mediaChange = (event: any) => {
        themeStore.setThemeBySystem(event.matches);
      };
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', mediaChange);
      return () => {
        mediaQuery.removeEventListener('change', mediaChange);
      };
    }
  }, [themeStore._theme]);

  if (routesStore.loading) {
    return <div>Loading...</div>;
  }

  if (routesStore.routesStatus === 401) {
    return <div></div>;
  }

  const ibmStyle = {
    '--cds-interactive': 'var(--supos-theme-color)',
    '--cds-focus': 'var(--supos-theme-color)',
    '--cds-border-interactive': 'var(--supos-theme-color)',
  };

  return (
    <>
      <CookieContext />
      <IntlProvider
        messages={I18nStore?.langMessage['messages'] as any}
        locale={I18nStore?.lang}
        defaultLocale={'en'}
        onError={(error) => console.error(error)}
      >
        {/*ibm组件库的主题*/}
        <Theme theme={themeStore.theme.includes('dark') ? 'g100' : 'white'} style={ibmStyle}>
          {/*antd组件库的主题*/}
          <ConfigProvider locale={I18nStore.langMessage['antd'] as any} theme={themeToken}>
            <UnsTreeMapProvider>
              <AntApp>
                <RouterProvider router={browserRouter} />
              </AntApp>
            </UnsTreeMapProvider>
          </ConfigProvider>
        </Theme>
      </IntlProvider>
    </>
  );
}

export default observer(App);
