import { loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

// 获取通用的Remotes 相关信息  name：/Alert
export const getRemotesInfo = ({ name }: { name: string }) => {
  return {
    name: `supos-ce${name}`,
    entry: `${import.meta.env.VITE_ENABLE_LOCAL_REMOTE === '1' && import.meta.env.DEV ? import.meta.env.VITE_REMOTE_PREFIX : window.origin + '/plugin' + name}/mf-manifest.json`,
  };
};

// 获取国际化信息
export const getPluginI18n = async ({ name, lang }: { name: string; lang: string }) => {
  let messages: any = await loadRemote(`supos-ce${name}/${lang === 'zh-CN' ? 'zhCN' : 'enUS'}`);
  messages = messages?.default || messages;
  if (messages.error && typeof messages?.error === 'object') {
    return {};
  }
  const newMessages: any = {};
  const prefix: string = name.substring(1);
  Object.entries(messages).forEach(([key, value]) => {
    newMessages[`${prefix}.${key}`] = value;
  });
  return newMessages;
};

// 预先加载插件国际化
export const preloadPluginLang = async (remoteList: { name: string }[], lang: string) => {
  // 注册
  registerRemotes(
    remoteList.map(({ name }) => {
      return getRemotesInfo({ name });
    })
  );
  let finallyMsg = {};
  // 获取远端国际化
  const messagePromises = remoteList.map(async ({ name }) => {
    try {
      return await getPluginI18n({ name, lang });
    } catch (err) {
      console.log(`Failed to load i18n for plugin ${name}:`, err);
      return {};
    }
  });

  const resolvedMessages = await Promise.all(messagePromises);
  resolvedMessages.forEach((messages) => {
    finallyMsg = {
      ...finallyMsg,
      ...messages,
    };
  });

  return finallyMsg;
};
