// src/hooks/useTranslate.ts
/* 
  多语言切换时在组件中使用
  getIntl () 获取当前语言  使用方法  
  import { useTranslate } from '@/hooks';
  const formatMessage = useTranslate();
  formatMessage('common.chatbot')
*/
import { useIntl } from 'react-intl';

// 自定义的 useTranslate 钩子
const useTranslate = () => {
  const { formatMessage } = useIntl();

  // 简化调用，只传入 id，返回翻译文本, opt是配置项
  return (id: string, opt?: any, defaultMessage?: string, description?: string | object) =>
    formatMessage({ id: id, defaultMessage: defaultMessage, description: description }, opt);
};

export default useTranslate;
