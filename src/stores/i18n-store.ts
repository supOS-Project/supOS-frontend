/* 
  多语言切换时在ts 文件中使用
  getIntl () 获取当前语言  使用方法  导入本文件后 getIntl('id')
*/
import { storageOpt, loadMessages } from '@/utils';
import { runInAction, makeAutoObservable } from 'mobx';

import { createIntl, createIntlCache } from 'react-intl';
import { SUPOS_LANG_MESSAGE, SUPOS_LANG } from '@/common-types/constans.ts';

export enum I18nEnum {
  EnUS = 'en-US',
  ZhCN = 'zh-CN',
}
type I18nData = {
  antd: any;
  messages: any;
};

const intlCache = createIntlCache();

export class I18nStore {
  lang: string = storageOpt.get(SUPOS_LANG) || I18nEnum.EnUS;
  langMessage: I18nData = storageOpt.get(SUPOS_LANG_MESSAGE) || { antd: {}, messages: {} };

  constructor() {
    makeAutoObservable(this);
  }
  async seti18nextLng(lang: string = I18nEnum.EnUS) {
    return await loadMessages(lang as I18nEnum).then((res: I18nData) => {
      storageOpt.set(SUPOS_LANG_MESSAGE, res);
      // node-red的语言
      storageOpt.setOrigin('editor-language', lang);
      // emq的语言
      storageOpt.setOrigin('language', lang === I18nEnum.EnUS ? 'en' : 'zh');
      // chat2db语言
      storageOpt.setOrigin('lang', lang === I18nEnum.EnUS ? 'en-us' : 'zh-cn');
      // supos语言
      storageOpt.setOrigin(SUPOS_LANG, lang);
      runInAction(() => {
        this.langMessage = res;
        this.lang = lang;
      });
    });
  }

  get intl() {
    return createIntl(
      {
        locale: this.lang,
        messages: this.langMessage.messages,
      },
      intlCache
    );
  }
  getIntl(id: string, opt?: any, defaultMessage?: string, description?: string | object) {
    return this.intl.formatMessage(
      {
        id: id,
        defaultMessage: defaultMessage,
        description: description,
      },
      opt
    );
  }
}

export default new I18nStore();
