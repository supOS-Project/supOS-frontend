import { Location, useNavigate } from 'react-router-dom';
import Layout from '@/layout';
import Uns from '@/pages/uns';
import Todo from '@/pages/todo';
import GrafanaDesign from '@/pages/grafana-design';
import AppDisplay from '@/pages/app-management/AppDisplay';
import AppSpace from '@/pages/app-management/AppSpace';
import AppGUI from '@/pages/app-management/AppGUI';
import AppPreview from '@/pages/app-management/AppPreview';
import AppIframe from '@/pages/app-management/AppIframe';
import NotFoundPage from '@/pages/not-found-Page';
import CollectionFlow from '@/pages/collection-flow';
import FlowPreview from '@/pages/collection-flow/FlowPreview';
import Dashboards from '@/pages/dashboards';
import DashboardsPreview from '@/pages/dashboards/DashboardsPreview';
import Home from '@/pages/home';
import AccountManagement from '@/pages/account-management';
import I18nStore from '@/stores/i18n-store';
import AboutUs from '@/pages/aboutus';
import AdvancedUse from '@/pages/advanced-use';
import DevPage from '@/pages/dev-page';
import NoPermission from '@/pages/not-found-Page/NoPermission';
import Alert from '@/pages/alert';
import { LOGIN_URL } from '@/common-types/constans';
import { observer } from 'mobx-react-lite';
import { useRoutesContext } from '@/contexts/routes-context';
import Share from '@/pages/share';
import EventFlow from '@/pages/event-flow';
import EventFlowPreview from '@/pages/event-flow/FlowPreview.tsx';

// 根路径重定向到外部login页
const RootRedirect = observer(() => {
  const routesStore = useRoutesContext();
  window.location.href = routesStore?.systemInfo?.loginPath || LOGIN_URL;
  return null;
});

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
      name: I18nStore.getIntl('common.todo', 'To-do'),
    },
  },
  {
    path: '/grafana-design',
    Component: GrafanaDesign,
    handle: {
      parentPath: '/_common',
      name: I18nStore.getIntl('common.grafanaDesign', 'GrafanaDesign'),
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
      name: I18nStore.getIntl('route.appIframe', 'AppIframe'),
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
      name: I18nStore.getIntl('route.appGUI', 'AppGUI'),
    },
  },
  {
    path: '/app-preview',
    Component: AppPreview,
    handle: {
      parentPath: '/app-space',
      name: I18nStore.getIntl('route.appPreview', 'AppPreview'),
    },
  },
  {
    path: '/collection-flow',
    Component: CollectionFlow,
  },
  {
    path: '/flow-editor',
    Component: FlowPreview,
    handle: {
      parentPath: '/collection-flow',
      name: I18nStore.getIntl('route.flowEditor', 'FlowEditor'),
    },
  },
  {
    path: '/EventFlow',
    Component: EventFlow,
  },
  {
    path: '/EvenFlowEditor',
    Component: EventFlowPreview,
    handle: {
      parentPath: '/EventFlow',
      name: I18nStore.getIntl('route.eventFlowEditor', 'EventFlowEditor'),
    },
  },
  {
    path: '/dashboards',
    Component: Dashboards,
  },
  {
    path: '/dashboards-preview',
    Component: DashboardsPreview,
    handle: {
      parentPath: '/dashboards',
      name: I18nStore.getIntl('route.dashboardsPreview', 'DashboardsPreview'),
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
    },
  },
  {
    path: '/alert',
    Component: Alert,
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
    path: '/share',
    Component: Share,
  },
  {
    path: '/403',
    Component: NoPermission,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const useLocationNavigate = () => {
  const navigate = useNavigate();
  return (location: Partial<Location>) => {
    const { pathname, search, state } = location;
    navigate(pathname + (search ?? ''), { state });
  };
};

export default routes;
