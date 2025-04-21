import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { MENU_TARGET_PATH, STORAGE_PATH } from '@/common-types/constans';

type I18n = 'zh-CN' | 'en-US';
type I18nData = {
  antd: any;
  messages: any;
};

// 服务器上语言包的基础 URL
const SERVER_BASE_URL = `${STORAGE_PATH}${MENU_TARGET_PATH}`;

// 动态加载语言包并转换为react-intl期望的格式
export const loadMessages = async (lang: I18n) => {
  try {
    // 加载本地语言包
    let localMessages = {};
    try {
      const localResponse = await fetch(`/locale/${lang}.json`);
      if (localResponse.ok) {
        localMessages = await localResponse.json();
      } else {
        console.warn(`Failed to load local language file for ${lang}:`, `HTTP error! status: ${localResponse.status}`);
      }
    } catch (localError) {
      console.warn(`Failed to load local language file for ${lang}:`, localError);
    }

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

    const data: I18nData = { antd: enUS, messages: {} }; // 初始值可以是默认语言包
    if (lang === 'en-US') {
      data['antd'] = enUS;
    } else {
      data['antd'] = zhCN;
    }
    // 将获取到的语言包数据转换为react-intl期望的格式
    data['messages'] = messages;
    return data;
  } catch (error) {
    console.error(`Error loading language file for ${lang}:`, error);
    return { antd: {}, messages: {} };
  }
};
