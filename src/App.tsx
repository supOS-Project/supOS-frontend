import { useEffect, useMemo } from 'react';
import { App as AntApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { getRoutesDom, RoutesElement } from '@/routers';
import CookieContext from '@/CookieContext';
import themeToken from './theme/theme-token.ts';
import 'shepherd.js/dist/css/shepherd.css';
import './App.css';
import { userLogin } from '@/apis/chat2db';
import { UnsTreeMapProvider } from '@/UnsTreeMapContext';
import { MENU_TARGET_PATH, STORAGE_PATH } from '@/common-types/constans.ts';
import LanguageProvider from './LanguageProvider.tsx';
import { queryChat2dbCurUser } from '@/utils/chat2db.ts';
import { checkImageExists, getBaseUrl, isInIframe } from '@/utils/url-util.ts';
import { fetchBaseStore, useBaseStore } from '@/stores/base';
import { setThemeBySystem, ThemeType, useThemeStore } from '@/stores/theme-store.ts';
import { cleanupI18nSubscriptions } from './stores/i18n-store.ts';
import Cookies from 'js-cookie';
import { useTranslate } from '@/hooks';

function App() {
  const { systemInfo, loading, routesStatus, currentUserInfo, pickedRoutesOptions } = useBaseStore((state) => ({
    systemInfo: state.systemInfo,
    loading: state.loading,
    routesStatus: state.routesStatus,
    pickedRoutesOptions: state.pickedRoutesOptions,
    currentUserInfo: state.currentUserInfo,
  }));
  const _theme = useThemeStore((state) => state._theme);

  const formatMessage = useTranslate();

  useEffect(() => {
    const isOmc = isInIframe([], 'webview');
    if (isOmc) {
      Cookies.set('omc_model', '1', {
        expires: 365,
      });
    } else {
      Cookies.remove('omc_model', { path: '/' });
    }
    // 初始化
    fetchBaseStore(true);
    return () => {
      cleanupI18nSubscriptions();
    };
  }, []);

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
    if (!systemInfo.appTitle) return;
    const loadFavicon = async () => {
      if (systemInfo?.themeConfig?.browseTitle) {
        document.title = systemInfo.themeConfig.browseTitle;
      } else {
        document.title = `${systemInfo.appTitle} ${formatMessage('common.excellence')}`;
      }
      const baseUrl = `${getBaseUrl()}${systemInfo?.themeConfig?.browseIcon || `${STORAGE_PATH}${MENU_TARGET_PATH}/logo-ico.svg`}`;
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
  }, [systemInfo]);

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

  const routeDom = useMemo(() => {
    return getRoutesDom({ pickedRoutesOptions, systemInfo, currentUserInfo });
  }, [pickedRoutesOptions, systemInfo, currentUserInfo]);

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
            <BrowserRouter>
              <RoutesElement routeDom={routeDom} />
            </BrowserRouter>
          </AntApp>
        </UnsTreeMapProvider>
      </LanguageProvider>
    </>
  );
}

export default App;
