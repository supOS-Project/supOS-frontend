import { Location, RouteObject, useNavigate, useRoutes } from 'react-router-dom';
import Layout from '@/layout';
import Uns from '@/pages/uns';
import Todo from '@/pages/todo';
import GrafanaDesign from '@/pages/grafana-design';
import AppDisplay from '@/pages/app-management/AppDisplay';
import AppSpace from '@/pages/app-management/AppSpace';
import AppGUI from '@/pages/app-management/AppGUI';
import AppPreview from '@/pages/app-management/AppPreview';
import AppIframe from '@/pages/app-management/AppIframe';
import NotFoundPage from '@/pages/not-found-Page/NotFoundPage';
import NotPage from '@/pages/not-found-Page';
import CollectionFlow from '@/pages/collection-flow';
import FlowPreview from '@/pages/collection-flow/FlowPreview';
import Dashboards from '@/pages/dashboards';
import DashboardsPreview from '@/pages/dashboards/DashboardsPreview';
import Home from '@/pages/home';
import AccountManagement from '@/pages/account-management';
import AboutUs from '@/pages/aboutus';
import AdvancedUse from '@/pages/advanced-use';
import DevPage from '@/pages/dev-page';
import NoPermission from '@/pages/not-found-Page/NoPermission';
import { LOGIN_URL } from '@/common-types/constans';
import Share from '@/pages/share';
import EventFlow from '@/pages/event-flow';
import EventFlowPreview from '@/pages/event-flow/FlowPreview.tsx';
import PluginManagement from '@/pages/plugin-management';
import qs from 'qs';
import { useEffect } from 'react';
import { useBaseStore } from '@/stores/base';
import { getIntl } from '@/stores/i18n-store.ts';
import { setToken } from '@/utils';
import DynamicMFComponent from '../components/dynamic-mf-component';
import DynamicIframe from '@/pages/dynamic-iframe';
import { RoutesProps, SystemInfoProps, UserInfoProps } from '@/stores/types.ts';

// 根路径重定向到外部login页

const RootRedirect = () => {
  const { currentUserInfo, systemInfo } = useBaseStore((state) => ({
    currentUserInfo: state.currentUserInfo,
    systemInfo: state.systemInfo,
  }));
  const params = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  useEffect(() => {
    if (params?.isLogin) {
      window.location.href = currentUserInfo?.homePage || '/home';
    } else {
      window.location.href = systemInfo?.loginPath || LOGIN_URL;
    }
  }, [params?.isLogin]);
  return null;
};

const FreeLoginLoader = () => {
  const params = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  useEffect(() => {
    if (params?.token) {
      setToken(params.token as string, {
        expires: 0.25,
      });
      window.location.href = '/?isLogin=true';
    } else {
      window.location.href = '/403';
    }
  }, [params?.token]);
  return null;
};

export const childrenRoutes = [
  {
    path: '/home',
    Component: Home,
  },
  {
    path: '/uns',
    Component: Uns,
  },
  {
    path: '/todo',
    Component: Todo,
    handle: {
      parentPath: '/_common',
      name: getIntl('common.todo', 'To-do'),
      menuNameKey: 'common.todo',
      type: 'all',
    },
  },
  {
    path: '/grafana-design',
    Component: GrafanaDesign,
    handle: {
      parentPath: '/_common',
      name: getIntl('common.grafanaDesign', 'GrafanaDesign'),
      menuNameKey: 'common.grafanaDesign',
    },
  },
  {
    path: '/app-display',
    Component: AppDisplay,
  },
  {
    path: '/app-iframe',
    Component: AppIframe,
    handle: {
      parentPath: '/app-display',
      name: getIntl('route.appIframe', 'AppIframe'),
      menuNameKey: 'route.appIframe',
    },
  },
  {
    path: '/app-space',
    Component: AppSpace,
  },
  {
    path: '/app-gui',
    Component: AppGUI,
    handle: {
      parentPath: '/app-space',
      name: getIntl('route.appGUI', 'AppGUI'),
      menuNameKey: 'route.appGUI',
    },
  },
  {
    path: '/app-preview',
    Component: AppPreview,
    handle: {
      parentPath: '/app-space',
      name: getIntl('route.appPreview', 'AppPreview'),
      menuNameKey: 'route.appPreview',
    },
  },
  {
    path: '/collection-flow',
    Component: CollectionFlow,
  },
  {
    path: '/collection-flow/flow-editor',
    Component: FlowPreview,
    handle: {
      parentPath: '/collection-flow',
      name: getIntl('route.flowEditor', 'SourceFlow Editor'),
      menuNameKey: 'route.flowEditor',
    },
  },
  {
    path: '/EventFlow',
    Component: EventFlow,
  },
  {
    path: '/EvenFlow/Editor',
    Component: EventFlowPreview,
    handle: {
      parentPath: '/EventFlow',
      name: getIntl('route.eventFlowEditor', 'EventFlow Editor'),
      menuNameKey: 'route.eventFlowEditor',
    },
  },
  {
    path: '/dashboards',
    Component: Dashboards,
  },
  {
    path: '/dashboards/preview',
    Component: DashboardsPreview,
    handle: {
      parentPath: '/dashboards',
      name: getIntl('route.dashboardsPreview', 'DashboardsPreview'),
      menuNameKey: 'route.dashboardsPreview',
    },
  },

  {
    path: '/account-management',
    Component: AccountManagement,
  },
  {
    path: '/aboutus',
    Component: AboutUs,
  },
  {
    path: '/advanced-use',
    Component: AdvancedUse,
  },
  {
    path: '/dev-page',
    Component: DevPage,
    handle: {
      name: 'devPage',
      type: 'dev',
    },
  },
  {
    path: '/plugin-management',
    Component: PluginManagement,
  },
  {
    path: '/403',
    Component: NoPermission,
    handle: {
      parentPath: '/_common',
      name: '403',
      type: 'all',
    },
  },
  {
    path: '/404',
    element: <NotFoundPage />,
    handle: {
      parentPath: '/_common',
      name: '404',
      type: 'all',
    },
  },
];

const routes = [
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/',
    element: <Layout />,
    children: childrenRoutes,
  },
  {
    path: '/freeLogin',
    element: <FreeLoginLoader />,
    // 数据路由无法使用
    // loader: ({ request }: any) => {
    //   const url = new URL(request.url);
    //   const token = url.searchParams.get('token');
    //   if (token) {
    //     console.log('123');
    //     // 免登录逻辑
    //     // 21600秒 = 6小时 = 0.25天
    //     setToken(token, {
    //       expires: 0.25,
    //     });
    //     return redirect('/?isLogin=true');
    //   }
    //   return null;
    // },
  },
  {
    path: '/share',
    Component: Share,
  },
  {
    path: '*',
    element: <NotPage />,
  },
];

export const getRoutesDom = ({
  pickedRoutesOptions,
  systemInfo,
  currentUserInfo,
}: {
  pickedRoutesOptions: RoutesProps[];
  systemInfo?: SystemInfoProps;
  currentUserInfo?: UserInfoProps;
}) => {
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
  }) as RouteObject[];
};

export const RoutesElement = ({ routeDom }: { routeDom: RouteObject[] }) => {
  return useRoutes(routeDom);
};

export const useLocationNavigate = () => {
  const navigate = useNavigate();
  return (location: Partial<Location>) => {
    const { pathname, search, state } = location;
    navigate(pathname + (search ?? ''), { state });
  };
};
