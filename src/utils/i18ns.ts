import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import localZhCN from '@/locale/zh-CN.json';
import localEnUS from '@/locale/en-US.json';

import { MENU_TARGET_PATH, STORAGE_PATH } from '@/common-types/constans';

type I18n = 'zh-CN' | 'en-US';
export type I18nData = { [x: string]: string };

// 服务器上语言包的基础 URL
const SERVER_BASE_URL = `${STORAGE_PATH}${MENU_TARGET_PATH}`;

const localSources: { [x: string]: any } = {
  'zh-CN': localZhCN,
  'en-US': localEnUS,
};

export const antSources: { [x: string]: any } = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 动态加载语言包并转换为react-intl期望的格式
export const loadMessages = async (lang: I18n) => {
  try {
    // 加载本地语言包
    const localMessages = localSources[lang];

    // 尝试从 MinIO 服务器加载语言包
    let minioMessages = {};
    try {
      const response = await fetch(`${SERVER_BASE_URL}/${lang}.json`);
      if (response.ok) {
        minioMessages = await response.json();
      } else {
        console.warn(`Failed to load language file from MinIO for ${lang}:`, `HTTP error! status: ${response.status}`);
      }
    } catch (minioError) {
      console.warn(`Failed to load language file from MinIO for ${lang}:`, minioError);
    }

    // 合并语言包，以MinIO服务器的为准
    const messages = { ...localMessages, ...minioMessages };

    // 如果两个来源都没有加载到语言包，则抛出错误
    if (Object.keys(messages).length === 0) {
      throw new Error(`Failed to load any language file for ${lang}`);
    }

    const data: I18nData = messages; // 初始值可以是默认语言包

    return data;
  } catch (error) {
    console.error(`Error loading language file for ${lang}:`, error);
    return {};
  }
};
