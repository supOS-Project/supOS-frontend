import { UseBoundStoreWithEqualityFn, createWithEqualityFn } from 'zustand/traditional';
import { StoreApi } from 'zustand';
import { shallow } from 'zustand/vanilla/shallow';
import { DataItem, RoutesProps, UserInfoProps } from '@/stores/types.ts';
import { storageOpt } from '@/utils/storage';
import {
  APP_TITLE,
  SUPOS_LANG,
  SUPOS_UNS_TREE,
  SUPOS_USER_BUTTON_LIST,
  SUPOS_USER_GUIDE_ROUTES,
  SUPOS_USER_LAST_LOGIN_ENABLE,
  SUPOS_USER_TIPS_ENABLE,
} from '@/common-types/constans.ts';
import { getRoutes, getSystemConfig, getUserInfo, postPickRoutes } from '@/apis/inter-api';
import { getPluginListApi } from '@/apis/inter-api/plugin.ts';
import {
  Criteria,
  filterArrays,
  filterByMatch,
  filterContainerList,
  filterObjectArrays,
  getGroupedData,
  getGroupedOptions,
  getTags,
  handleButtonPermissions,
  multiGroupByCondition,
} from '@/stores/utils.ts';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { getToken, preloadPluginLang } from '@/utils';
import { isBoolean, isEmpty, map } from 'lodash';
import dayjs from 'dayjs';
import { TBaseStore } from '@/stores/base/type.ts';
import { initI18n, defaultLanguage, I18nEnum } from '../i18n-store.ts';
import 'dayjs/locale/zh-cn';

const loadDayjsLocale = (locale: string) => {
  dayjs.locale(locale);
};

/**
 * 系统基础store
 * @description 路由、用户信息、系统信息、当前菜单信息等
 */
export const initBaseContent = {
  rawRoutes: [],
  routes: [],
  pickedRoutes: [],
  pickedRoutesOptions: [],
  pickedRoutesOptionsNoChildrenMenu: [],
  parentOrderMap: {},
  pickedGroupRoutes: [],
  pickedGroupRoutesForHome: [],
  currentUserInfo: {},
  systemInfo: { appTitle: '' },
  dataBaseType: [],
  dashboardType: [],
  userTipsEnable: storageOpt.getOrigin(SUPOS_USER_TIPS_ENABLE) || '',
  pluginList: [],
  loading: true,
};

export const useBaseStore: UseBoundStoreWithEqualityFn<StoreApi<TBaseStore>> = createWithEqualityFn(
  () => initBaseContent,
  shallow
);

// 设置用户tipsEnable
export const setUserTipsEnable = (value: string) => {
  storageOpt.setOrigin(SUPOS_USER_TIPS_ENABLE, value);
  useBaseStore.setState({
    userTipsEnable: value,
  });
};

// 更新路由基础方法 (私有)
const updateBaseStore = async (isFirst: boolean = false) => {
  if (isFirst) {
    try {
      // 首次需要同时拿到用户信息的url和路由
      const [{ value: routes, reason }, { value: info }, { value: systemInfo }, { value: pluginList }]: any =
        await Promise.allSettled([getRoutes(), getUserInfo(), getSystemConfig(), getPluginListApi()]);

      const criteria: Criteria<DataItem> = {
        buttonGroup: (item: any) => item?.uri?.includes('button:'),
      };
      const { buttonGroup, others } = multiGroupByCondition(info?.resourceList, criteria);
      const { buttonGroup: denyButtonGroup, others: denyOthers } = multiGroupByCondition(
        info?.denyResourceList,
        criteria
      );
      const pickedRouters = filterObjectArrays(denyOthers, others);

      // 设置title
      document.title = systemInfo?.appTitle || APP_TITLE;
      // 存储button权限信息
      storageOpt.set(
        SUPOS_USER_BUTTON_LIST,
        systemInfo?.authEnable === false || info?.superAdmin === true
          ? handleButtonPermissions(['button:*'], ButtonPermission) || []
          : filterArrays(
              handleButtonPermissions(denyButtonGroup?.map((i: any) => i.uri) || [], ButtonPermission) || [],
              handleButtonPermissions(buttonGroup?.map((i: any) => i.uri) || [], ButtonPermission) || []
            ) || []
      );

      // 储存用户信息
      storageOpt.set('personInfo', {
        username: info?.preferredUsername,
      });
      const containerList = filterContainerList(systemInfo?.containerMap);
      const _routes = filterByMatch(routes, pickedRouters, systemInfo?.authEnable && !info?.superAdmin);
      const pickedRoutes = _routes?.filter((f) => f.menu?.picked);
      const pickedRoutesOptions = getGroupedOptions(pickedRoutes);
      const parentOrderMap =
        getTags(_routes?.find((f) => getTags(f?.service?.tags || [])?.root)?.service?.tags || []) || {};
      // 设置
      useBaseStore.setState({
        ...initBaseContent,
        rawRoutes: routes,
        pluginList,
        routesStatus: reason?.status,
        currentUserInfo: {
          ...info,
          roleList: info?.roleList || [],
          roleString: info?.roleList?.map((i: any) => i.roleName)?.join('/') || '',
          buttonList: buttonGroup?.map((i: any) => i.uri) || [],
          pageList: pickedRouters || [],
          superAdmin: info?.superAdmin,
        },
        routes: _routes,
        pickedRoutes,
        pickedRoutesOptions,
        pickedRoutesOptionsNoChildrenMenu: pickedRoutesOptions?.filter((f) => !f.isRemoteChildMenu),
        parentOrderMap,
        pickedGroupRoutes: getGroupedData(pickedRoutes, parentOrderMap),
        pickedGroupRoutesForHome: getGroupedData(pickedRoutes, parentOrderMap, 'homeParentName'),
        systemInfo: {
          ...(systemInfo ?? {}),
          appTitle: systemInfo?.appTitle || APP_TITLE,
        },
        containerList,
        dataBaseType: systemInfo?.containerMap?.tdengine?.envMap?.service_is_show ? ['tdengine'] : ['timescale'],
        mqttBrokeType: systemInfo?.containerMap?.emqx?.name,
        dashboardType:
          containerList.aboutUs
            ?.filter((i) => ['fuxa', 'grafana'].includes(i.name) && i.envMap?.service_is_show)
            ?.map((m) => m.name) ?? [],
      });

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
      const unsTreeInfo = storageOpt.get(SUPOS_UNS_TREE);
      if (unsTreeInfo) {
        storageOpt.set(SUPOS_UNS_TREE, { ...unsTreeInfo, state: { lazyTree: systemInfo?.lazyTree } });
      } else {
        storageOpt.set(SUPOS_UNS_TREE, { state: { lazyTree: systemInfo?.lazyTree }, version: 0 });
      }
      // 如果为免登录，则判断是否存在新手导航数据，存在则继续触发，不存在则添加
      if (notLogin) {
        if (!storageOpt.getOrigin(SUPOS_USER_TIPS_ENABLE)) {
          setUserTipsEnable('1');
        }
        if (!storageOpt.get(SUPOS_USER_GUIDE_ROUTES)) {
          storageOpt.set(
            SUPOS_USER_GUIDE_ROUTES,
            map(_routes, (route) => ({ name: route.name, menu: route.menu, isVisited: false }))
          );
        }
      }
      // 如果是登录状态
      if (isLoginEnable) {
        // 判断用户是否手动禁用tips展示
        const tipsEnable = info?.tipsEnable;
        if (tipsEnable && !storageOpt.getOrigin(SUPOS_USER_TIPS_ENABLE)) {
          setUserTipsEnable('1');
        }
        if (!tipsEnable) {
          setUserTipsEnable('0');
        }
        const isFirstLogin = info?.firstTimeLogin;
        // 首次登录且未初始化用户引导路由信息，则需初始化该信息；已经初始化则继续使用缓存的状态
        if (isFirstLogin === 1 && !storageOpt.get(SUPOS_USER_GUIDE_ROUTES)) {
          storageOpt.set(
            SUPOS_USER_GUIDE_ROUTES,
            map(_routes, (route) => ({ name: route.name, menu: route.menu, isVisited: false }))
          );
        }
        // 由于存在手动启用新手导航功能，先取消清除的逻辑
        // if (isFirstLogin !== 1) {
        //   // 非首次登录直接清除用户引导路由信息
        //   storageOpt.remove(SUPOS_USER_GUIDE_ROUTES);
        // }
      }
      const _lang =
        import.meta.env.REACT_APP_LOCAL_LANG || systemInfo?.lang || storageOpt.getOrigin(SUPOS_LANG) || defaultLanguage;
      const pluginLang = await preloadPluginLang(
        pluginList
          ?.filter((f: any) => f.installStatus === 'installed')
          ?.filter((f: any) => f?.plugInfoYml?.route?.name)
          ?.map((m: any) => ({ name: `/${m?.plugInfoYml?.route?.name}` })) || [],
        systemInfo?.lang
      );
      loadDayjsLocale(_lang === I18nEnum.EnUS ? 'en' : 'zh-cn');
      // 首次需要初始化语言包
      return await initI18n(_lang, pluginLang);
    } catch (_) {
      console.log(_);
      // 首次需要初始化语言包
      return await initI18n(storageOpt.getOrigin(SUPOS_LANG) || defaultLanguage);
    }
  } else {
    const baseState = useBaseStore.getState();
    return getRoutes()
      .then((data: any) => {
        const routes: RoutesProps[] = filterByMatch(
          data,
          baseState?.currentUserInfo?.pageList,
          baseState.systemInfo?.authEnable && !baseState.currentUserInfo?.superAdmin
        );
        const pickedRoutes = routes?.filter((f) => f.menu?.picked);
        const pickedRoutesOptions = getGroupedOptions(pickedRoutes);
        const parentOrderMap =
          getTags(routes?.find((f) => getTags(f?.service?.tags || [])?.root)?.service?.tags || []) || {};
        useBaseStore.setState({
          rawRoutes: data,
          routes,
          pickedRoutes: routes?.filter((f) => f.menu?.picked),
          pickedRoutesOptions: getGroupedOptions(pickedRoutes),
          pickedRoutesOptionsNoChildrenMenu: pickedRoutesOptions?.filter((f) => !f.isRemoteChildMenu),
          parentOrderMap,
          pickedGroupRoutes: getGroupedData(pickedRoutes, parentOrderMap),
          pickedGroupRoutesForHome: getGroupedData(pickedRoutes, parentOrderMap, 'homeParentName'),
        });
        return routes;
      })
      .catch(() => {});
  }
};

// 初始化获取baseStore
export const fetchBaseStore = async (isFirst: boolean = false): Promise<any> => {
  return updateBaseStore(isFirst).finally(() => {
    useBaseStore.setState({
      loading: false,
    });
  });
};

// 更新选中的路由
export const postRoutes = async (data: { menuName?: string; picked?: boolean }[]) => {
  return postPickRoutes(data).then(() => {
    // 更新路由
    updateBaseStore();
    return true;
  });
};

// 设置当前菜单信息
export const setCurrentMenuInfo = (data: RoutesProps) => {
  useBaseStore.setState({
    currentMenuInfo: data,
  });
};

// 手动更新用户信息
export const updateForUserInfo = (info: UserInfoProps) => {
  useBaseStore.setState({
    currentUserInfo: {
      ...useBaseStore.getState().currentUserInfo,
      ...info,
    },
  });
};

export const setPluginList = (pluginList: any[]) => {
  useBaseStore.setState({
    pluginList,
  });
};
