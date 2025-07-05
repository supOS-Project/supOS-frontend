import { ContainerItemProps, RoutesProps, SystemInfoProps, UserInfoProps } from '@/stores/types.ts';

export type TBaseStore = {
  // 最原始的routes
  rawRoutes: RoutesProps[];
  // 动态路由集合(未处理过的)
  routes: RoutesProps[];
  // 筛选出勾选的路由
  pickedRoutes: RoutesProps[];
  // 可给select使用
  pickedRoutesOptions: RoutesProps[];
  // 可给select使用
  pickedRoutesOptionsNoChildrenMenu: RoutesProps[];
  // 父级排序
  parentOrderMap: { [key: string]: string };
  // 带分组
  pickedGroupRoutes: RoutesProps[];
  // 带分组，给home页用
  pickedGroupRoutesForHome: RoutesProps[];
  // 路由状态，401控制
  routesStatus?: number;
  // 用户信息集合
  currentUserInfo: UserInfoProps;
  // 系统信息集合
  systemInfo: SystemInfoProps;
  // 高阶使用和关于我们
  containerList?: {
    advancedUse?: ContainerItemProps[];
    aboutUs?: ContainerItemProps[];
  };
  // 数据库类型 TimescaleDB tdEngine
  dataBaseType: string[];
  // mqtt broke类型 emqx gmqtt
  mqttBrokeType?: string;
  // 数据看板类型 fuxa grafana
  dashboardType: string[];
  // 当前菜单信息
  currentMenuInfo?: RoutesProps;
  // 用户是否启用tips
  userTipsEnable: string;
  loading: boolean;
  // 插件列表
  pluginList: any[];
  // 按钮权限列表
  buttonList: string[];
};
