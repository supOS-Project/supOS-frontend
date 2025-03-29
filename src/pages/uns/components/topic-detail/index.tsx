import { useState, useEffect, FC, useRef } from 'react';
import { getInstanceInfo, triggerRestApi } from '@/apis/inter-api/uns';
import { useWebSocket } from 'ahooks';
import { App, Button, Collapse, Flex, theme } from 'antd';
import { CaretRight, SendAlt, Document } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import type { CSSProperties } from 'react';
import type { CollapseProps } from 'antd';
import Details from './Details';
import TopologyChart from './TopologyChart';
import Definition from './Definition';
import Payload from './Payload';
import Dashboard from './Dashboard';
import RawData from './RawData';
import SqlQuery from './SqlQuery';
import DocumentList from '@/pages/uns/components/DocumentList.tsx';
import UploadButton from '@/pages/uns/components/UploadButton.tsx';
import { isJsonString } from '@/utils';
import { AuthButton, AuthWrapper } from '@/components';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { useMediaSize } from '@/hooks';
import { useRoutesContext } from '@/contexts/routes-context.ts';

const Module: FC<any> = (props) => {
  const { currentPath, setDeleteOpen, fileStatusInfo } = props;
  const { dashboardType } = useRoutesContext();
  const { message } = App.useApp();
  const formatMessage = useTranslate();
  const documentListRef = useRef();
  const [instanceInfo, setInstanceInfo] = useState<any>({});
  const [isRestApi, setIsRestApi] = useState<boolean>(false);
  const [activeList, setActiveList] = useState<string[]>([
    'topologyChart',
    'definition',
    'payload',
    'dashboard',
    'rawData',
    'sqlQuery',
  ]);
  const [websocketData, setWebsocketData] = useState<any>({});
  const { token } = theme.useToken();

  const panelStyle: React.CSSProperties = {
    background: 'val(--supos-bg-color)',
    border: 'none',
  };

  const { isH5 } = useMediaSize();
  useWebSocket(
    `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/inter-api/supos/uns/ws?topic=${encodeURIComponent(currentPath)}`,
    {
      onMessage: (event) => {
        const dataJson = event.data;
        if (isJsonString(dataJson)) {
          const data = JSON.parse(dataJson);
          if (!isJsonString(data.payload)) {
            data.payload = null;
          }
          setWebsocketData(data);
        }
      },
      onError: (error) => console.error('WebSocket error:', error),
    }
  );

  useEffect(() => {
    setWebsocketData({});
    if (currentPath) {
      getInstanceInfo({ topic: currentPath })
        .then((data: any) => {
          if (data?.fields) {
            if (data?.protocol?.pageDef) {
              data.protocol.params = data.protocol.params || [];
              data.protocol.params.unshift(data.protocol.pageDef.start, data.protocol.pageDef.offset);
            }
            if (data.protocol?.params) {
              data.protocol.paramsObj = {};
              data.protocol.params.forEach((e: any) => {
                data.protocol.paramsObj[e.key] = e.value;
              });
            }
            if (data?.protocol?.headers) {
              data.protocol.headersObj = {};
              data?.protocol?.headers?.forEach((e: any) => {
                data.protocol.headersObj[e.key] = e.value;
              });
            }
            if (data?.dataType === 1 && data?.protocol?.protocol === 'icmp') {
              setActiveList([
                'detail',
                'topologyChart',
                'definition',
                'payload',
                'document',
                'dashboard',
                'rawData',
                'sqlQuery',
              ]);
            }
            setIsRestApi(() => {
              const isRest = data?.dataType === 2 && data?.protocol?.protocol === 'rest';
              if (isRest) {
                // 不发送
                // triggerRestApi({
                //   topic: currentPath,
                // });
              }
              return isRest;
            });
            setInstanceInfo(data);
          }
        })
        .catch(() => {});
      setActiveList(['topologyChart', 'definition', 'payload', 'document', 'dashboard', 'rawData', 'sqlQuery']);
    }
  }, [currentPath]);

  const deleteTopic = () => {
    setDeleteOpen({ path: currentPath, type: 2 });
  };
  const getItems: (panelStyle: CSSProperties, instanceInfo: any) => CollapseProps['items'] = (
    panelStyle,
    instanceInfo
  ) => {
    const items = [
      {
        key: 'detail',
        label: formatMessage('common.detail'),
        children: (
          <Details
            instanceInfo={instanceInfo}
            updateTime={websocketData?.updateTime}
            websocketData={websocketData}
            fileStatusInfo={fileStatusInfo}
          />
        ),
        style: panelStyle,
      },
      {
        key: [1, 2, 3, 6].includes(instanceInfo.dataType)
          ? instanceInfo?.protocol?.protocol === 'icmp'
            ? ''
            : 'payload'
          : '',
        label: formatMessage('uns.payload'),
        children: <Payload websocketData={websocketData} />,
        style: panelStyle,
      },
      {
        key: instanceInfo?.protocol?.protocol === 'icmp' ? '' : 'definition',
        label: formatMessage('uns.definition'),
        children: <Definition instanceInfo={instanceInfo} />,
        style: panelStyle,
      },
      ...(!isH5
        ? [
            {
              key:
                instanceInfo?.protocol?.protocol === 'icmp'
                  ? ''
                  : instanceInfo.withDashboard && instanceInfo.withSave2db && dashboardType?.includes('grafana')
                    ? 'dashboard'
                    : '',
              label: formatMessage('uns.dashboard'),
              children: <Dashboard instanceInfo={instanceInfo} />,
              style: panelStyle,
            },
            {
              key: [1, 2].includes(instanceInfo.dataType)
                ? instanceInfo?.protocol?.protocol === 'icmp'
                  ? ''
                  : 'topologyChart'
                : '',
              label: formatMessage('uns.topology'),
              children: (
                <TopologyChart instanceInfo={instanceInfo} payload={websocketData?.data} dt={websocketData?.dt || {}} />
              ),
              style: panelStyle,
            },
          ]
        : []),
      {
        key: [1, 2, 3, 6].includes(instanceInfo.dataType)
          ? instanceInfo?.protocol?.protocol === 'icmp'
            ? ''
            : 'rawData'
          : '',
        label: formatMessage('uns.rawData'),
        children: <RawData payload={websocketData?.payload} />,
        style: panelStyle,
      },
      ...(!isH5
        ? [
            {
              key: instanceInfo?.protocol?.protocol === 'icmp' ? '' : 'sqlQuery',
              label: formatMessage('uns.dataOperation'),
              children: <SqlQuery instanceInfo={instanceInfo} currentPath={currentPath} />,
              style: panelStyle,
            },
          ]
        : []),
      {
        key: 'document',
        label: formatMessage('common.document'),
        children: <DocumentList alias={instanceInfo.alias} ref={documentListRef} />,
        style: panelStyle,
        extra: (
          <UploadButton
            auth={ButtonPermission['uns.uploadDoc']}
            alias={instanceInfo.alias}
            documentListRef={documentListRef}
          />
        ),
      },
    ];
    return items.filter((item: any) => item.key);
  };
  const onRestApiSend = () => {
    if (isRestApi) {
      triggerRestApi({
        topic: currentPath,
      }).then(() => {
        message.success(formatMessage('common.optsuccess'));
      });
    }
  };
  return (
    <div className="topicDetailWrap">
      <div
        className="topicDetailContent"
        style={{
          paddingLeft: 5,
          paddingRight: 5,
          paddingBottom: '20px',
        }}
      >
        <Flex className="detailTitle" style={{ paddingLeft: '16px' }} justify="flex-start" align="center" gap={12}>
          <div>
            <Document
              size={20}
              style={{
                marginRight: '8px',
              }}
            />
            {instanceInfo.name}
          </div>
          {isRestApi && (
            <AuthButton
              size="small"
              title={formatMessage('common.send')}
              auth={ButtonPermission['uns.fileRestSend']}
              onClick={onRestApiSend}
              style={{ border: '1px solid #C6C6C6', background: 'var(--supos-uns-button-color)', marginRight: 16 }}
              icon={<SendAlt />}
            />
          )}
        </Flex>
        <div className="tableWrap">
          <Collapse
            bordered={false}
            collapsible="header"
            activeKey={activeList}
            onChange={(even) => setActiveList(even)}
            expandIcon={({ isActive }) => (
              <CaretRight size={20} style={{ rotate: isActive ? '90deg' : '0deg', transition: '200ms' }} />
            )}
            style={{ background: token.colorBgContainer }}
            items={getItems(panelStyle, instanceInfo)}
          />
        </div>
        <AuthWrapper auth={ButtonPermission['uns.delete']}>
          <div className="deleteBtnWrap">
            <Button type="primary" style={{ width: '100px', fontWeight: 'bold' }} onClick={deleteTopic}>
              {formatMessage('common.delete')}
            </Button>
          </div>
        </AuthWrapper>
      </div>
    </div>
  );
};
export default Module;
