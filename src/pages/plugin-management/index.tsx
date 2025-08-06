import { FC, useCallback, useRef, useState } from 'react';
import { PageProps } from '@/common-types';
import { SoftwareResourceCluster as _App, InformationFilled, Grid, List, FolderAdd } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import { Flex, Space, Tag, Typography, App, Popover, Empty, Segmented, Spin, Upload, Button } from 'antd';
const { Paragraph } = Typography;
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { AuthButton } from '@/components/auth';
import ComCard from '@/components/com-card';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import InlineLoading from '@/components/inline-loading';
import { getPluginListApi, installPluginApi, unInstallPluginApi, upgradePluginApi } from '@/apis/inter-api/plugin.ts';
import useSimpleRequest from '../../hooks/useSimpleRequest.ts';
import IconImage from '../../components/icon-image';
import { useThemeStore } from '@/stores/theme-store.ts';
import { formatTimestamp } from '@/utils/format.ts';
import { preloadPluginLang } from '@/utils/plugin.ts';
import { connectI18nMessage, useI18nStore } from '@/stores/i18n-store.ts';
import { fetchBaseStore, setPluginList } from '@/stores/base';
import { useActivate } from '@/contexts/tabs-lifecycle-context.ts';
import { useTabsContext } from '@/contexts/tabs-context.ts';
import { useLocalStorageState } from 'ahooks';
import styles from './index.module.scss';
import ProTable from '@/components/pro-table';
import ProModal from '@/components/pro-modal/index.tsx';
const { Dragger } = Upload;

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
  const commonFormatMessage = useTranslate();
  return (
    <div style={{ overflow: 'hidden', margin: '4px 0' }}>
      <Flex justify="space-between">
        <Flex style={{ flex: 1, overflow: 'hidden' }} gap={4} title={vendorName}>
          <span>{commonFormatMessage('common.dev')}:</span>
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
        <Flex style={{ flexShrink: 0 }} align="center" gap={4} title={version}>
          <span>{commonFormatMessage('common.version')}:</span>
          <div>{version}</div>
        </Flex>
      </Flex>
      <Flex style={{ flex: 1, overflow: 'hidden' }} gap={4} title={vendorName}>
        <span>{commonFormatMessage('common.name')}:</span>
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

const CardOperation = ({
  info,
  status,
  appId,
  routeName,
  appProperties,
  refreshRequest,
  setLoading,
  openModal,
}: any) => {
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
    (status: string, info?: any) => {
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
              <AuthButton
                auth={ButtonPermission['pluginManagement.update']}
                size="small"
                type="primary"
                onClick={() => openModal(info)}
              >
                {formatMessage('plugin.update')}
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
              <AuthButton
                auth={ButtonPermission['pluginManagement.update']}
                size="small"
                type="primary"
                onClick={() => openModal(info)}
              >
                {formatMessage('plugin.update')}
              </AuthButton>
            </Space>
          );
        case 'installed':
          return (
            <Space>
              <AuthButton
                disabled={info?.plugInfoYml?.removable === false}
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
              <AuthButton
                auth={ButtonPermission['pluginManagement.update']}
                size="small"
                type="primary"
                onClick={() => openModal(info)}
              >
                {formatMessage('plugin.update')}
              </AuthButton>
            </Space>
          );
        default:
          return <InlineLoading status="active" description={formatMessage('plugin.' + status)} />;
      }
    },
    [status, appId, appProperties]
  );

  return <>{getDom(status, info)}</>;
};
const LoadingOperation = ({ d, refreshRequest, openModal }: any) => {
  const { plugInfoYml = {} } = d;
  const [loading, setLoading] = useState(false);
  return (
    <Spin spinning={loading}>
      <CardOperation
        status={d?.installStatus}
        appId={d?.name}
        routeName={plugInfoYml?.route?.name}
        refreshRequest={refreshRequest}
        setLoading={setLoading}
        openModal={openModal}
        info={d}
      />
    </Spin>
  );
};
const LoadingCard = ({ d, refreshRequest, openModal }: any) => {
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const [loading, setLoading] = useState(false);
  const { plugInfoYml = {}, name } = d;
  return (
    <ComCard
      key={plugInfoYml.name}
      updateTime={formatTimestamp(d?.installTime)}
      style={{ width: 350, height: 285 }}
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
          openModal={openModal}
          info={d}
        />
      }
    />
  );
};

const IconImageWrapper = ({ record }: any) => {
  const primaryColor = useThemeStore((state) => state.primaryColor);

  return (
    <>
      <IconImage
        theme={primaryColor}
        width={20}
        height={20}
        wrapperStyle={{ marginRight: 8 }}
        iconName={record?.plugInfoYml?.route?.homeIconUrl ?? record?.plugInfoYml?.route?.icon}
      />
      {record?.plugInfoYml?.showName}
    </>
  );
};
const Index: FC<PageProps> = ({ title }) => {
  const onSuccessCallback = (data: any[]) => {
    setPluginList(data);
  };
  const commonFormatMessage = useTranslate();
  const [open, setOpen] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const selectName = useRef('');
  const [uploadTitle, setUploadTitle] = useState('save');

  const [mode, setMode] = useLocalStorageState<string>('SUPOS_PLUGIN_MODE', {
    defaultValue: 'card',
  });
  const { loading, data, refreshRequest } = useSimpleRequest({
    fetchApi: getPluginListApi,
    onSuccessCallback,
    // autoRefresh: true,
  });
  useActivate(() => {
    getPluginListApi();
  });

  const columns: any = [
    {
      dataIndex: 'showName',
      ellipsis: true,
      fixed: 'left',
      title: commonFormatMessage('common.pluginName'),
      width: '20%',
      render: (_: string, record: any) => {
        return <IconImageWrapper record={record} />;
      },
    },
    {
      dataIndex: 'vendorName',
      ellipsis: true,
      title: commonFormatMessage('common.dev'),
      width: '10%',
      render: (_: string, record: any) => {
        return record?.plugInfoYml?.vendorName;
      },
    },
    {
      dataIndex: 'version',
      ellipsis: true,
      title: commonFormatMessage('common.version'),
      width: '10%',
      render: (_: string, record: any) => {
        return record?.plugInfoYml?.version;
      },
    },
    {
      dataIndex: 'name',
      ellipsis: true,
      title: commonFormatMessage('common.name'),
      width: '10%',
    },
    {
      dataIndex: 'description',
      ellipsis: true,
      title: commonFormatMessage('common.description'),
      width: '23%',
      render: (_: string, record: any) => {
        return record?.plugInfoYml?.description;
      },
    },
    {
      dataIndex: 'installTime',
      ellipsis: true,
      title: commonFormatMessage('common.installTime'),
      width: '10%',
      render: (t: number) => {
        return formatTimestamp(t);
      },
    },
    {
      dataIndex: 'installStatus',
      ellipsis: true,
      title: commonFormatMessage('common.states'),
      width: '5%',
      render: (status: string) => {
        const info = StatusOptions?.find((f) => f.value === status) ?? {
          value: status,
          label: 'plugin.' + status,
          color: 'blue',
        };
        return (
          <Tag bordered={false} color={info?.color} style={{ borderRadius: 9, height: 16, lineHeight: '16px' }}>
            {commonFormatMessage(info?.label)}
          </Tag>
        );
      },
    },
    {
      dataIndex: 'operation',
      ellipsis: true,
      fixed: 'right',
      title: commonFormatMessage('common.operation'),
      width: '10%',
      render: (_: any, record: any) => {
        return <LoadingOperation openModal={openModal} d={record} refreshRequest={refreshRequest} />;
      },
    },
  ];
  const onClose = () => {
    setFileList([]);
    setUploadTitle('save');
    setOpen(false);
    setButtonLoading(false);
  };
  const openModal = (info: any) => {
    selectName.current = info.name;
    setOpen(true);
  };
  const { message } = App.useApp();
  const [buttonLoading, setButtonLoading] = useState(false);
  const onSave = () => {
    if (fileList.length) {
      setButtonLoading(true);
      setUploadTitle('uploading');
      const item = fileList[0];
      upgradePluginApi([
        { value: item, name: 'file', fileName: item.name },
        { value: String(selectName.current), name: 'name' },
      ])
        .then(() => {
          setUploadTitle('unZiping');
          setTimeout(() => {
            setButtonLoading(false);
            setUploadTitle('save');
            refreshRequest?.();
            onClose();
            message.success(commonFormatMessage('common.optsuccess'));
          }, 1000);
        })
        .catch(() => {
          setButtonLoading(false);
          setUploadTitle('save');
        });
    } else {
      message.warning(commonFormatMessage('uns.pleaseUploadTheFile'));
    }
  };
  const beforeUpload = (file: any) => {
    const fileType = file.name.split('.').pop();
    if (file.size <= 1024 * 1024 * 1024 * 2) {
      if (['gz'].includes(fileType.toLowerCase())) {
        setFileList([file]);
      } else {
        message.warning(commonFormatMessage('common.theFileFormatType', { fileType: '.gz' }));
      }
    } else {
      message.warning(commonFormatMessage('common.theFileSizeMax', { size: '2GB' }));
    }
    return false;
  };
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
        className={styles['plugin-management']}
      >
        <Flex justify="flex-end" align="center" style={{ marginTop: 16, paddingRight: 16 }}>
          <Segmented
            size="small"
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              {
                value: 'card',
                icon: (
                  <span className={styles['flex']} title={commonFormatMessage('common.cardMode')}>
                    <Grid />
                  </span>
                ),
              },
              {
                value: 'list',
                icon: (
                  <span className={styles['flex']} title={commonFormatMessage('common.listMode')}>
                    <List />
                  </span>
                ),
              },
            ]}
          />
        </Flex>
        <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          {mode === 'card' ? (
            <Flex gap={18} wrap align="flex-start" justify="flex-start">
              {data.length > 0 ? (
                data?.map((d: any) => {
                  return <LoadingCard key={d.name} openModal={openModal} d={d} refreshRequest={refreshRequest} />;
                })
              ) : (
                <Empty style={{ width: '100%' }} />
              )}
            </Flex>
          ) : (
            <ProTable
              resizeable
              style={{ height: '100%' }}
              scroll={{ y: 'calc(100vh  - 285px)', x: 'max-content' }}
              dataSource={data as any}
              columns={columns}
              pagination={false}
            />
          )}
        </div>
      </ComContent>
      <ProModal
        aria-label=""
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{commonFormatMessage('plugin.upload')}</span>
          </div>
        }
        onCancel={onClose}
        open={open}
        className="importModalWrap"
        size="xxs"
      >
        <Dragger
          className="uploadWrap"
          action=""
          accept=".tar.gz"
          maxCount={1}
          fileList={fileList}
          disabled={buttonLoading}
          beforeUpload={beforeUpload}
          onRemove={() => {
            setFileList([]);
          }}
        >
          <Flex vertical align="center" gap={10}>
            <FolderAdd size={100} style={{ color: '#E0E0E0' }} />
            <span style={{ fontSize: 12 }}>{commonFormatMessage('common.theFileFormatType', { fileType: '.gz' })}</span>
          </Flex>
        </Dragger>
        <Button
          loading={buttonLoading}
          color="primary"
          variant="solid"
          block
          onClick={onSave}
          style={{ marginTop: 20 }}
        >
          {commonFormatMessage(`common.${uploadTitle}`)}
        </Button>
      </ProModal>
    </ComLayout>
  );
};

export default Index;
