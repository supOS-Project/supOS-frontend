import { ReactElement } from 'react';

export interface TagProps {
  key: string;
  value: string;
}
export interface RoutesProps {
  /**
   * @description 作为唯一key,如果是iframe类型的会用来拼接成前端路由 uns  => /uns
   * */
  name: string;
  /**
   * @description 国际化显示名称
   * */
  showName: string;
  /**
   * @description 菜单信息 picked：是否显示，url：实际路由地址 暂时无用
   * */
  menu?: { picked: boolean; url: string };
  /**
   * @description 对应konga的 parentName: 分组名称；   iconUrl: icon地址；  description: 描述；  menu表示展示前端； menuName菜单名称；menuPort、menuProtocol、menuHost: iframe的实际host;
   * {key: 国际化的key（既是tag的值），没有国际话的话是''，value是国际化的内容,如果key是空的，value就是tag的值} =》 {key: '', value: menu} {key: 'parentName:DevTools', value: 'DevTools'}
   * */
  tags?: TagProps[];
  /**
   * @description 用来判断是否是前端路由
   * */
  isFrontend?: boolean;
  /**
   * @description 用来判断是否有子建
   * */
  hasChildren?: boolean;
  /**
   * @description routes的上级service，以root为frontend来区分是否是前端还是iframe, description提过tag拿来作为描述
   * */
  service?: {
    id: string;
    name: string;
    /**
     * @description iconUrl:  icon地址; root:frontend表示是前端的路由; description: 父级描述；
     * */
    tags?: string[];
  };
  children?: RoutesProps[];
  parentName?: string;
  // parentName国际化
  parentNameI18?: string;
  key?: string;
  parentKey?: string;
  iconComp?: ReactElement;
  iconUrl?: string;
  description?: string;
  selectKey?: string[];
  selectKeyPath?: string[];
  // 排序
  sort?: string;
  // menu的port
  menuPort?: string;
  menuProtocol?: string;
  menuHost?: string;
  status?: number | string;
}

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
   * @description 页面 /xxx
   * */
  pageList?: DataItem[];
  /**
   * @description 按钮权限 button:xxx
   * */
  buttonList?: DataItem[];
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
  // 关于我们 高阶使用配置
  containerMap?: {
    [key: string]: ContainerItemProps;
  };
  // 单topic还是多topic影响demo的数据展示
  multipleTopic?: boolean;
}
