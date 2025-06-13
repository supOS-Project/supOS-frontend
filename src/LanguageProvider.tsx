import { ConfigProvider } from 'antd';
import { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { useI18nStore } from '@/stores/i18n-store.ts';

interface PropsTypes {
  config?: any;
  children: ReactNode;
}

const LanguageProvider = (props: PropsTypes) => {
  const { children, config = {} } = props;
  const { lang, langMessages, antMessages } = useI18nStore();
  return (
    <IntlProvider messages={langMessages} locale={lang} defaultLocale={'en'} onError={(error) => console.error(error)}>
      <ConfigProvider locale={antMessages} {...config}>
        {children}
      </ConfigProvider>
    </IntlProvider>
  );
};

export default LanguageProvider;
