export interface DataItem {
  policyId: string;
  resourceId: string;
  url: string;
}
export interface UserInfoProps {
  /**
   * @description 邮箱
   * */
  email?: string;
  /**
   * @description 邮箱是否验证
   * */
  emailVerified?: boolean;
  /**
   * @description 展示名
   * */
  firstName?: string;
  /**
   * @description 用户名
   * */
  preferredUsername?: string;
  /**
   * @description 用户唯一id
   * */
  sub?: string;
  /**
   * @description 角色列表
   * */
  roleList?: { roleDescription: string; roleId: string; roleName: string }[];
  roleString?: string;
  /**
   * @description 页面 /xxx   用户资源组
   * */
  pageList?: DataItem[];
  // 登录后跳转的地址
  homePage?: string;
  // 是否是超管
  superAdmin?: boolean;
  // 用户有的权限
  buttonGroup?: any[];
  // 用户拒绝优先的权限
  denyButtonGroup?: any[];
  /**
   * @description 按钮权限 button:xxx 用户实际存在的按钮权限（通过组合拒绝优先权限过滤出来）
   * */
  buttonList?: DataItem[];
  // 手机号
  phone?: string;
  // 来源，带source = external的  不允许编辑和删除
  source?: string;
}
export interface ContainerItemProps {
  name: string;
  version: string;
  description?: string;
  envMap?: {
    service_is_show: boolean;
    service_logo: boolean;
    service_redirect_url?: boolean;
    service_account?: string;
    service_password?: string;
  };
}
export interface SystemInfoProps {
  // 为false的话不进行鉴权
  authEnable?: boolean;
  // 语言
  lang?: string;
  // 版本
  version?: string;
  // 模型
  llmType?: 'openai' | 'ollama';
  // 端口号
  mqttTcpPort?: string;
  // 端口号
  mqttWebsocketTslPort?: string;
  // 登录地址
  loginPath?: string;
  // title
  appTitle?: string;
  lazyTree?: boolean;
  // 关于我们 高阶使用配置
  containerMap?: {
    [key: string]: ContainerItemProps;
  };
  // 单topic还是多topic影响demo的数据展示
  multipleTopic?: boolean;
  // 是否使用别名作为topic
  useAliasPathAsTopic?: boolean;

  qualityName?: string;
  timestampName?: string;
  // 是否启用ladp用户体系
  ldapEnable?: boolean;

  // 主题插件配置信息
  themeConfig?: any;
}

/**
 * @description 资源：目录、菜单、按钮
 * */
export interface ResourceProps {
  // 父级ID
  parentId?: string;
  // 主键ID
  id: string;
  // 菜单分组 1-导航 2-菜单 home    属于哪组  3-tab home页tab
  groupType?: number;
  // 菜单类型（1-目录 2-菜单 3-按钮）
  type: number;
  // icon 不写类型默认svg, 不传默认使用code
  icon?: string;
  // konga的name既唯一键
  code: string;
  // 用code转成的国际化name
  showName?: string;
  // 国际化的描述key
  description?: string;
  // 国际化描述
  showDescription?: string;
  // 排序
  sort: number;
  // 创建时间
  createAt?: number;
  // 更新时间
  updateAt?: number;
  // 地址
  url?: string;
  // 类型 1-内部地址（前端地址） 2-外部链接（iframe地址）
  urlType?: number;
  // 打开方式：0-多页签 1-新窗口打开
  openType?: number;
  // 备注
  remark?: string;
  // 启用状态
  enable?: boolean;
  // ============
  children?: ResourceProps[];
  // 是否是子菜单，比如 /EvenFlow/Edit，那就是子菜单
  subMenu?: boolean;
  parentCode?: string;
  // 是否是前端写死的路由
  isFrontend?: boolean;
  // 是否是插件模块
  isRemote?: boolean;
  // 子模块,直接使用的是 url 去掉/
  remoteModelName?: boolean;
  // 是否选中
  checked?: boolean;
}
