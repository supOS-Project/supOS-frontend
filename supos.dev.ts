import dotenv from 'dotenv';
import colors from 'picocolors';

export interface DevInfo {
  BASE_URL: string;
  API_PROXY_URL: string;
  SINGLE_API_PROXY_URL: string;
  SINGLE_API_PROXY_LIST: string;
}

export const parseConfig = (config: any) => {
  const newConfig: any = {};
  Object.keys(config).forEach((key) => {
    const value = config[key];
    newConfig[key] = value === 'true' ? true : value === 'false' ? false : value;
  });
  return newConfig;
};

export const proxyList = [
  'inter-api',
  'hasura/home/v1/graphql',
  'gateway',
  'copilotkit',
  'chat2db/api',
  'minio/inter/supos',
  'files/system/resource',
];

export const getProxy = (
  baseUrl: string = 'http://office.unibutton.com:11488',
  singleList: string,
  singleUrl: string = 'http://office.unibutton.com:11488'
) => {
  const proxyConfig: any = {};

  if (singleList) {
    singleList?.split(',')?.forEach?.((name) => {
      proxyConfig[`/${name}`] = {
        target: singleUrl,
        changeOrigin: true,
        ws: true,
      };
    });
  }

  proxyList.forEach((name) => {
    proxyConfig[`/${name}`] = {
      target: baseUrl,
      changeOrigin: true,
      ws: true,
    };
  });
  // 给iframe加个代理
  proxyConfig['/iframe'] = {
    target: baseUrl,
    changeOrigin: true,
    rewrite: (path: any) => path.replace(/^\/iframe/, ''),
  };
  // 给chat2db加个代理
  proxyConfig['/chat2db/home/'] = {
    target: baseUrl,
    changeOrigin: true,
  };
  return proxyConfig;
};

// == 开发信息
export const getDevInfo = (): DevInfo => {
  const defaultEnv = dotenv.config();
  const localEnv = dotenv.config({ path: '.env.local' });
  const defaultEnvConfig = parseConfig(defaultEnv.parsed || {});
  const localEnvConfig = parseConfig(localEnv.parsed || {});
  return { ...defaultEnvConfig, ...localEnvConfig } as DevInfo;
};

export const logDevInfo = (info: DevInfo) => {
  const isProdCli = process.env.NODE_ENV === 'production';
  if (isProdCli) return;
  const { API_PROXY_URL, SINGLE_API_PROXY_URL, SINGLE_API_PROXY_LIST } = info;
  console.log('---------- 开发信息 ----------');
  console.log(colors.gray('接口代理'), API_PROXY_URL, '\n');
  console.log(colors.gray('特殊接口代理'), SINGLE_API_PROXY_URL, '\n');
  console.log(colors.gray('特殊接口List'), SINGLE_API_PROXY_LIST, '\n');
};
