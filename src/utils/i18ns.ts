import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { MENU_TARGET_PATH, STORAGE_PATH } from '@/common-types/constans';

type I18n = 'zh-CN' | 'en-US';
type I18nData = {
  antd: any;
  messages: any;
};

// MinIO 服务器上语言包的基础 URL
const MINIO_BASE_URL = `${STORAGE_PATH}${MENU_TARGET_PATH}`;

// 动态加载语言包并转换为react-intl期望的格式
export const loadMessages = async (lang: I18n) => {
  try {
    // 首先尝试从 MinIO 服务器加载语言包
    let messages;
    try {
      const response = await fetch(`${MINIO_BASE_URL}/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      messages = await response.json();
    } catch (minioError) {
      console.warn(`Failed to load language file from MinIO for ${lang}, falling back to local file:`, minioError);
      // 如果从 MinIO 加载失败，则从本地加载
      const localResponse = await fetch(`/locale/${lang}.json`);
      messages = await localResponse.json();
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
