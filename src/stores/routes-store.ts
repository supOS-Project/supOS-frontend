import { makeAutoObservable, runInAction } from 'mobx';
import { isBoolean, isEmpty, map } from 'lodash';
import { getRoutes, postPickRoutes } from '@/apis/inter-api/kong';
import { getUserInfo } from '@/apis/inter-api/auth.ts';
import {
  Criteria,
  filterByMatch,
  handleButtonPermissions,
  multiGroupByCondition,
  getGroupedData,
  getGroupedOptions,
  getTags,
  filterArrays,
  filterObjectArrays,
  filterContainerList,
} from '@/stores/utils';
import { getToken, storageOpt } from '@/utils';
import {
  APP_TITLE,
  SUPOS_LANG,
  SUPOS_USER_BUTTON_LIST,
  SUPOS_USER_GUIDE_ROUTES,
  SUPOS_USER_LAST_LOGIN_ENABLE,
  SUPOS_USER_TIPS_ENABLE,
} from '@/common-types/constans.ts';
import { getSystemConfig } from '@/apis/inter-api/system-config';
import i18nStore, { I18nEnum } from '@/stores/i18n-store';
import { ButtonPermission } from '@/common-types/button-permission';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn.js';
import 'dayjs/locale/en.js';

import { ContainerItemProps, DataItem, RoutesProps, SystemInfoProps, UserInfoProps } from '@/stores/types';
export interface TagProps {
  key: string;
  value: string;
}
const loadDayjsLocale = (locale: string) => {
  dayjs.locale(locale);
};

export class RoutesStore {
  // 最原始的routes
  rawRoutes: RoutesProps[] = [];
  // 动态路由集合(未处理过的)
  routes: RoutesProps[] = [];
  // 路由状态，401控制
  routesStatus?: number;
  // 用户信息集合
  currentUserInfo: UserInfoProps = {};
  // 系统信息集合
  systemInfo: SystemInfoProps = { appTitle: '' };
  // 高阶使用和关于我们
  containerList?: {
    advancedUse?: ContainerItemProps[];
    aboutUs?: ContainerItemProps[];
  };
  // 数据库类型 TimescaleDB tdEngine
  dataBaseType: string[] = [];
  // 数据看板类型 fuxa grafana
  dashboardType: string[] = [];
  // 当前菜单信息
  currentMenuInfo: RoutesProps | undefined;
  // 用户是否启用tips
  userTipsEnable: string = storageOpt.getOrigin(SUPOS_USER_TIPS_ENABLE) || '';
  loading = true;
  constructor() {
    makeAutoObservable(this);
    this.fetchRoutes(true);
  }

  // 筛选出勾选的路由
  get pickedRoutes() {
    return this.routes?.filter((f) => f.menu?.picked);
  }

  get pickedRoutesOptions() {
    return getGroupedOptions(this.pickedRoutes);
  }

  get parentOrderMap() {
    const info = this.routes?.find((f) => getTags(f?.service?.tags || [])?.root);
    return getTags(info?.service?.tags || []) || {};
  }

  get GroupRoutes() {
    return getGroupedData(this.routes, this.parentOrderMap);
  }

  get pickedGroupRoutes() {
    return getGroupedData(this.pickedRoutes, this.parentOrderMap);
  }

  get pickedGroupRoutesForHome() {
    return getGroupedData(this.pickedRoutes, this.parentOrderMap, 'homeParentName');
  }

  private async updateRoutes(isFirst: boolean = false) {
    if (isFirst) {
      try {
        // 首次需要同时拿到用户信息的url和路由
        const [{ value: routes, reason }, { value: info }, { value: systemInfo }]: any = await Promise.allSettled([
          getRoutes(),
          getUserInfo(),
          getSystemConfig(),
        ]);
        // console.log('初始化用户信息、路由、系统配置:', routes, info, systemInfo);
        const criteria: Criteria<DataItem> = {
          buttonGroup: (item: any) => item?.uri?.includes('button:'),
        };
        const { buttonGroup, others } = multiGroupByCondition(info?.resourceList, criteria);
        const { buttonGroup: denyButtonGroup, others: denyOthers } = multiGroupByCondition(
          info?.denyResourceList,
          criteria
        );

        const pickedRouters = filterObjectArrays(denyOthers, others);

        document.title = systemInfo?.appTitle || APP_TITLE;

        storageOpt.set(
          SUPOS_USER_BUTTON_LIST,
          systemInfo?.authEnable === false
            ? handleButtonPermissions(['button:*'], ButtonPermission) || []
            : filterArrays(
                handleButtonPermissions(denyButtonGroup?.map((i: any) => i.uri) || [], ButtonPermission) || [],
                handleButtonPermissions(buttonGroup?.map((i: any) => i.uri) || [], ButtonPermission) || []
              ) || []
        );

        runInAction(() => {
          this.rawRoutes = routes;
          this.routesStatus = reason?.status;
          this.currentUserInfo = {
            email: info?.email,
            sub: info?.sub,
            emailVerified: info?.emailVerified,
            preferredUsername: info?.preferredUsername,
            firstName: info?.name,
            roleList: info?.roleList || [],
            roleString: info?.roleList?.map((i: any) => i.roleName)?.join('/') || '',
            buttonList: buttonGroup?.map((i: any) => i.uri) || [],
            pageList: pickedRouters || [],
          };
          this.routes = filterByMatch(routes, pickedRouters, systemInfo?.authEnable);
          this.systemInfo = {
            ...(systemInfo ?? {}),
            appTitle: systemInfo?.appTitle || APP_TITLE,
          };
          const containerList = filterContainerList(systemInfo?.containerMap);
          this.containerList = containerList;
          this.dataBaseType = systemInfo?.containerMap?.tdengine?.envMap?.service_is_show
            ? ['tdengine']
            : ['timescale'];
          this.dashboardType =
            containerList.aboutUs
              ?.filter((i) => ['fuxa', 'grafana'].includes(i.name) && i.envMap?.service_is_show)
              ?.map((m) => m.name) ?? [];

          // 1.新手导航：根据authenable和token区分是否为免登录
          //      a.先获取上次免登录状态和当前比较，如果发生改变，则说明用户登录发生变化（比如由需要登陆变为免登或者免登变为需要），需要清除之前的SUPOS_USER_GUIDE_ROUTES状态，并设置新的免登状态
          //      b.然后判断当前是否为免登
          //          如果是免登录，先判断SUPOS_USER_GUIDE_ROUTES是否存在，不存在，则添加，存在则不做处理
          //          如果需要登陆，再按原有逻辑（用户第一次登录）进行引导
          // 2.tips: 用户访问时进入系统则展示tips，且可勾选不再展示（每次登录或者每次免登状态都需考虑）
          //         1).判断是否免登 2).是否为刚登录 3).判断用户是否支持展示

          const lastLoginEnable = storageOpt.getOrigin(SUPOS_USER_LAST_LOGIN_ENABLE);

          const token = getToken();
          const isLoginEnable = isBoolean(systemInfo?.authEnable) && !isEmpty(token);

          // 获取上次免登录状态和当前比较，如果发生改变，则说明用户登录发生变化,或者systemInfo?.authEnable获取失败则清除缓存
          if (!isBoolean(systemInfo?.authEnable) || lastLoginEnable !== `${isLoginEnable}`) {
            storageOpt.remove(SUPOS_USER_GUIDE_ROUTES);
            storageOpt.setOrigin(
              SUPOS_USER_LAST_LOGIN_ENABLE,
              `${isBoolean(systemInfo?.authEnable) ? isLoginEnable : systemInfo?.authEnable}`
            );
            storageOpt.remove(SUPOS_USER_TIPS_ENABLE);
          }

          // 是否为免登录：authEnable===false并且不存在token时
          const notLogin = systemInfo?.authEnable === false && !token;
          // 如果为免登录，则判断是否存在新手导航数据，存在则继续触发，不存在则添加
          if (notLogin) {
            if (!storageOpt.getOrigin(SUPOS_USER_TIPS_ENABLE)) {
              this.setUserTipsEnable('1');
            }
            if (!storageOpt.get(SUPOS_USER_GUIDE_ROUTES)) {
              storageOpt.set(
                SUPOS_USER_GUIDE_ROUTES,
                map(this.routes, (route) => ({ name: route.name, menu: route.menu, isVisited: false }))
              );
            }
          }
          // 如果是登录状态
          if (isLoginEnable) {
            // 判断用户是否手动禁用tips展示
            const tipsEnable = info?.tipsEnable;
            if (tipsEnable && !storageOpt.getOrigin(SUPOS_USER_TIPS_ENABLE)) {
              this.setUserTipsEnable('1');
            }
            if (!tipsEnable) {
              this.setUserTipsEnable('0');
            }
            const isFirstLogin = info?.firstTimeLogin;
            // 首次登录且未初始化用户引导路由信息，则需初始化该信息；已经初始化则继续使用缓存的状态
            if (isFirstLogin === 1 && !storageOpt.get(SUPOS_USER_GUIDE_ROUTES)) {
              storageOpt.set(
                SUPOS_USER_GUIDE_ROUTES,
                map(this.routes, (route) => ({ name: route.name, menu: route.menu, isVisited: false }))
              );
            }
            // 由于存在手动启用新手导航功能，先取消清除的逻辑
            // if (isFirstLogin !== 1) {
            //   // 非首次登录直接清除用户引导路由信息
            //   storageOpt.remove(SUPOS_USER_GUIDE_ROUTES);
            // }
          }
        });
        const _lang =
          import.meta.env.REACT_APP_LOCAL_LANG || systemInfo?.lang || storageOpt.getOrigin(SUPOS_LANG) || I18nEnum.EnUS;
        loadDayjsLocale(_lang === I18nEnum.EnUS ? 'en' : 'zh-cn');
        // 首次需要初始化语言包
        return await i18nStore.seti18nextLng(_lang);
      } catch (_: any) {
        console.log(_);
        // 首次需要初始化语言包
        return await i18nStore.seti18nextLng(storageOpt.getOrigin(SUPOS_LANG) || I18nEnum.EnUS);
      }
    }

    return getRoutes()
      .then((data: any) => {
        const routes: any = filterByMatch(data, this?.currentUserInfo?.pageList, this.systemInfo?.authEnable);
        runInAction(() => {
          this.rawRoutes = data;
          this.routes = routes;
        });
        return routes;
      })
      .catch(() => {});
  }

  // 获取所有路由
  async fetchRoutes(isFirst: boolean = false) {
    return this.updateRoutes(isFirst).finally(() => {
      runInAction(() => {
        this.loading = false;
      });
    });
  }

  // 更新选中的路由
  async postRoutes(data: { menuName?: string; picked?: boolean }[]) {
    return postPickRoutes(data).then(() => {
      // 请求接口更新
      this.updateRoutes();
      return true;
    });
  }

  setCurrentMenuInfo(data: RoutesProps) {
    this.currentMenuInfo = data;
  }

  // 手动更新用户名
  updateFirstNameForUserInfo(firstName: string) {
    this.currentUserInfo = {
      ...this.currentUserInfo,
      firstName,
    };
  }

  // 获取用户tipsEnable
  getUserTipsEnable = () => {
    return this.userTipsEnable;
  };

  // 设置用户tipsEnable
  setUserTipsEnable = (value: string) => {
    storageOpt.setOrigin(SUPOS_USER_TIPS_ENABLE, value);
    this.userTipsEnable = value;
  };
}

const routesStore = new RoutesStore();
export default routesStore;
