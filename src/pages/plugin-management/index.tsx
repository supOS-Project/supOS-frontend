import { FC, useCallback, useState } from 'react';
import { PageProps } from '@/common-types';
import { SoftwareResourceCluster as _App, InformationFilled } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import { Flex, Space, Tag, Typography, App, Popover, Empty } from 'antd';
const { Paragraph } = Typography;
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { AuthButton } from '@/components/auth';
import ComCard from '@/components/com-card';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import InlineLoading from '@/components/inline-loading';
import { getPluginListApi, installPluginApi, unInstallPluginApi } from '@/apis/inter-api/plugin.ts';
import useSimpleRequest from '../../hooks/useSimpleRequest.ts';
import IconImage from '../../components/icon-image';
import { useThemeStore } from '@/stores/theme-store.ts';
import { preloadPluginLang } from '@/utils';
import { connectI18nMessage, useI18nStore } from '@/stores/i18n-store.ts';
import { fetchBaseStore, setPluginList } from '@/stores/base';
import { useActivate } from '@/contexts/tabs-lifecycle-context.ts';
import { useTabsContext } from '@/contexts/tabs-context.ts';

const StatusOptions = [
  {
    value: 'notInstall',
    label: 'plugin.notInstall',
    color: '#E0E0E0',
  },
  {
    value: 'installFail',
    label: 'plugin.installFail',
    color: 'red',
  },
  {
    value: 'installed',
    label: 'plugin.installed',
    color: 'green',
  },
];

const CardSecondaryTitle = ({
  version,
  vendorName,
  name,
}: {
  latestFailMsg?: string;
  version?: string;
  vendorName?: string;
  name?: string;
}) => {
  return (
    <div style={{ overflow: 'hidden', margin: '4px 0' }}>
      <Flex style={{ flex: 1, overflow: 'hidden' }} align="center" gap={4} title={version}>
        <span>Version:</span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Paragraph
            ellipsis={{
              rows: 1,
            }}
            style={{ margin: 0, wordBreak: 'break-all', opacity: 0.6, lineHeight: '18px' }}
          >
            {version}
          </Paragraph>
        </div>
      </Flex>
      <Flex style={{ flex: 1, overflow: 'hidden' }} gap={4} title={vendorName}>
        <span>Dev:</span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Paragraph
            ellipsis={{
              rows: 1,
            }}
            style={{ margin: 0, wordBreak: 'break-all', opacity: 0.6, lineHeight: '18px' }}
          >
            {vendorName}
          </Paragraph>
        </div>
      </Flex>
      <Flex style={{ flex: 1, overflow: 'hidden' }} gap={4} title={vendorName}>
        <span>name:</span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Paragraph
            ellipsis={{
              rows: 1,
            }}
            style={{ margin: 0, wordBreak: 'break-all', opacity: 0.6, lineHeight: '18px' }}
          >
            {name}
          </Paragraph>
        </div>
      </Flex>
    </div>
  );
};

const CardTag = ({ status, latestFailMsg }: any) => {
  const formatMessage = useTranslate();
  const info = StatusOptions?.find((f) => f.value === status) ?? {
    value: status,
    label: 'plugin.' + status,
    color: 'blue',
  };
  return (
    <Flex align="center" gap={4}>
      {['installFail'].includes(status) && latestFailMsg && (
        <Popover
          content={<div style={{ maxWidth: 400, maxHeight: 400, overflow: 'auto' }}>{latestFailMsg}</div>}
          title={formatMessage('common.errorInfo')}
        >
          <InformationFilled color="red" />
        </Popover>
      )}
      <Tag bordered={false} color={info?.color} style={{ borderRadius: 9, height: 16, lineHeight: '16px' }}>
        {formatMessage(info?.label)}
      </Tag>
    </Flex>
  );
};

const CardOperation = ({ status, appId, routeName, appProperties, refreshRequest, setLoading }: any) => {
  const formatMessage = useTranslate();
  const lang = useI18nStore((state) => state.lang);
  const { TabsContext } = useTabsContext();
  const { message, modal } = App.useApp();
  const onOptHandle = (apiStr: string) => {
    setLoading(true);
    const api: any = {
      installPluginApi,
      unInstallPluginApi,
    };
    setLoading(true);
    api?.[apiStr]?.({ name: appId })
      .then(async () => {
        if (apiStr === 'installPluginApi') {
          // 安装成功，预先加载国际化
          try {
            const langMessages = await preloadPluginLang([{ name: `/${routeName}` }], lang);
            connectI18nMessage(langMessages);
          } catch (e) {
            console.error('插件国际化', e);
          }
        } else {
          // 移除多页签
          TabsContext?.current?.onCloseTab?.(`/${routeName}`);
        }
        refreshRequest?.();
        // 成功后刷新下菜单
        fetchBaseStore?.();
        message.success(formatMessage('common.optsuccess'));
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getDom = useCallback(
    (status: string) => {
      switch (status) {
        case 'notInstall':
          return (
            <Space>
              <AuthButton
                auth={ButtonPermission['pluginManagement.install']}
                size="small"
                type="primary"
                onClick={() => onOptHandle('installPluginApi')}
              >
                {formatMessage('plugin.install')}
              </AuthButton>
            </Space>
          );
        case 'installFail':
          return (
            <Space>
              <AuthButton
                auth={ButtonPermission['pluginManagement.install']}
                size="small"
                type="primary"
                onClick={() => onOptHandle('installPluginApi')}
              >
                {formatMessage('plugin.reInstall')}
              </AuthButton>
            </Space>
          );
        case 'installed':
          return (
            <Space>
              <AuthButton
                auth={ButtonPermission['pluginManagement.unInstall']}
                size="small"
                style={{ color: 'var(--supos-text-color)' }}
                onClick={() => {
                  modal.confirm({
                    title: formatMessage('common.uninstallConfirm'),
                    content: formatMessage('common.clearData'),
                    onOk: () => {
                      setLoading(true);
                      onOptHandle('unInstallPluginApi');
                    },
                    cancelButtonProps: {},
                    okText: formatMessage('common.confirm'),
                  });
                }}
              >
                {formatMessage('common.unInstall')}
              </AuthButton>
            </Space>
          );
        default:
          return <InlineLoading status="active" description={formatMessage('plugin.' + status)} />;
      }
    },
    [status, appId, appProperties]
  );

  return <>{getDom(status)}</>;
};

const LoadingCard = ({ d, refreshRequest }: any) => {
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const [loading, setLoading] = useState(false);
  const { plugInfoYml = {}, name } = d;
  return (
    <ComCard
      key={plugInfoYml.name}
      style={{ width: 600, height: 210 }}
      title={plugInfoYml.showName}
      secondaryTitle={
        <CardSecondaryTitle name={name} version={plugInfoYml?.version} vendorName={plugInfoYml?.vendorName} />
      }
      description={plugInfoYml?.description || ' '}
      tag={
        <Flex align="center" style={{ marginBottom: 6, marginTop: 2 }}>
          <CardTag status={d.installStatus} latestFailMsg={d.latestFailMsg} />
        </Flex>
      }
      customImage={
        <IconImage theme={primaryColor} iconName={plugInfoYml?.route?.homeIconUrl ?? plugInfoYml?.route?.icon} />
      }
      loading={loading}
      operation={
        <CardOperation
          status={d?.installStatus}
          appId={d?.name}
          routeName={plugInfoYml?.route?.name}
          refreshRequest={refreshRequest}
          setLoading={setLoading}
        />
      }
    />
  );
};

const Index: FC<PageProps> = ({ title }) => {
  const onSuccessCallback = (data: any[]) => {
    setPluginList(data);
  };
  const { loading, data, refreshRequest } = useSimpleRequest({
    fetchApi: getPluginListApi,
    onSuccessCallback,
    // autoRefresh: true,
  });
  useActivate(() => {
    getPluginListApi();
  });
  return (
    <ComLayout loading={loading}>
      <ComContent
        title={
          <div>
            <_App size={20} style={{ justifyContent: 'center', verticalAlign: 'middle' }} /> {title}
          </div>
        }
        hasBack={false}
        style={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <Flex gap={18} wrap align="flex-start" justify="flex-start">
            {data.length > 0 ? (
              data?.map((d: any) => {
                return <LoadingCard key={d.name} d={d} refreshRequest={refreshRequest} />;
              })
            ) : (
              <Empty style={{ width: '100%' }} />
            )}
          </Flex>
        </div>
      </ComContent>
    </ComLayout>
  );
};

export default Index;
