import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import localZhCN from '@/locale/zh-CN.json';
import localEnUS from '@/locale/en-US.json';
import { getProperties } from 'properties-file';
import { getSystemI18Api } from '@/apis/inter-api';

type I18n = 'zh-CN' | 'en-US';
export type I18nData = { [x: string]: string };

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

    // 尝试从 服务器加载语言包
    let backEndMessages = {};
    try {
      const content = await getSystemI18Api(lang);
      backEndMessages = getProperties(content);
    } catch (e) {
      console.log(e);
    }
    // 合并语言包，以后端服务器存储的为准
    const messages = { ...localMessages, ...backEndMessages };
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
