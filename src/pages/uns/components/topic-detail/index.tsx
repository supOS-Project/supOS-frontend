import { useState, useEffect, FC, useRef } from 'react';
import { createDashboard, getInstanceInfo, modifyModel, checkDashboardIsExist } from '@/apis/inter-api/uns';
import { useWebSocket } from 'ahooks';
import { Button, Collapse, Flex, theme, Typography, App } from 'antd';
import Icon from '@ant-design/icons';
import { CaretRight, Document, Code, TableSplit } from '@carbon/icons-react';
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
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { useMediaSize } from '@/hooks';
import EditDetailButton from '@/pages/uns/components/EditDetailButton';
import { InitTreeDataFnType, UnsTreeNode } from '@/pages/uns/types';
import FileEdit from '@/components/svg-components/FileEdit';
import { hasPermission } from '@/utils/auth';
import { isJsonString } from '@/utils/common';
import { useBaseStore } from '@/stores/base';

const { Title } = Typography;

export interface FileDetailProps {
  currentNode: UnsTreeNode;
  initTreeData: InitTreeDataFnType;
  handleDelete: (node: UnsTreeNode) => void;
}

interface InstanceInfoType {
  [key: string]: any;
}

const Module: FC<FileDetailProps> = (props) => {
  const {
    currentNode: { id },
    initTreeData,
  } = props;
  const { systemInfo } = useBaseStore((state) => ({
    systemInfo: state.systemInfo,
  }));
  const formatMessage = useTranslate();
  const { message } = App.useApp();
  const documentListRef = useRef();
  const [instanceInfo, setInstanceInfo] = useState<InstanceInfoType>({});
  const [createLoading, setCreateLoading] = useState(false);
  const [activeList, setActiveList] = useState<string[]>([
    'topologyChart',
    'definition',
    'payload',
    'dashboard',
    'sqlQuery',
  ]);
  const [showPayloadTable, setShowPayloadTable] = useState<boolean>(true);
  const [websocketData, setWebsocketData] = useState<any>({});
  const { token } = theme.useToken();

  const panelStyle: CSSProperties = {
    background: 'val(--supos-bg-color)',
    border: 'none',
  };

  const { isH5 } = useMediaSize();

  const longToJavaHex = (value: string, fullLength = false) => {
    const bigIntValue = BigInt(value);

    // 获取对应的无符号 64 位表示（补码兼容）
    const mask64 = 0xffffffffffffffffn;
    const unsigned = bigIntValue < 0n ? ((bigIntValue & mask64) + (1n << 64n)) & mask64 : bigIntValue & mask64;

    let hex = unsigned.toString(16);

    if (fullLength) {
      hex = hex.padStart(16, '0');
    }

    return hex;
  };

  useWebSocket(
    instanceInfo.id
      ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/inter-api/supos/uns/ws?id=${instanceInfo.id}`
      : '',
    {
      onMessage: (event) => {
        const dataJson = event.data;
        if (isJsonString(dataJson)) {
          const data = JSON.parse(dataJson);
          if (systemInfo.qualityName && data?.data?.[systemInfo.qualityName]) {
            //质量码做特殊处理
            data.data[systemInfo.qualityName] = longToJavaHex(data.data[systemInfo.qualityName]);
          }
          if (!isJsonString(data.payload)) {
            data.payload = null;
          }
          if (instanceInfo?.dataType === 2 && systemInfo.timestampName && data?.data?.[systemInfo.timestampName]) {
            //关系型文件手动隐藏消息体里的时间戳
            delete data.data[systemInfo.timestampName];
          }
          setWebsocketData(data);
        }
      },
      onError: (error) => console.error('WebSocket error:', error),
    }
  );

  useEffect(() => {
    setWebsocketData({});
    if (id) {
      getFileDetail(id as string);
    }
  }, [id]);

  const getFileDetail = (id: string) => {
    getInstanceInfo({ id })
      .then(async (data: any) => {
        if (data?.id) {
          if (data.withDashboard) {
            const { code } = await checkDashboardIsExist({ alias: data.alias });
            data.dashboardIsExist = code === 200;
          }
          setInstanceInfo(data);
        }
      })
      .catch(() => {});
  };

  const getItems: (panelStyle: CSSProperties, instanceInfo: InstanceInfoType) => CollapseProps['items'] = (
    panelStyle,
    instanceInfo
  ) => {
    const items = [
      {
        key: 'detail',
        label: formatMessage('common.detail'),
        children: <Details instanceInfo={instanceInfo} updateTime={websocketData?.updateTime} />,
        style: panelStyle,
        extra: (
          <EditDetailButton
            auth={ButtonPermission['uns.fileDetail']}
            modelInfo={instanceInfo}
            getModel={() => getFileDetail(id as string)}
          />
        ),
      },
      {
        key: 'definition',
        label: formatMessage('uns.definition'),
        children: <Definition instanceInfo={instanceInfo} />,
        style: panelStyle,
      },
      {
        key: [1, 2, 3, 6, 7].includes(instanceInfo.dataType) ? 'payload' : '',
        label: formatMessage('uns.payload'),
        children: showPayloadTable ? (
          <Payload websocketData={websocketData} fields={instanceInfo.fields || []} />
        ) : (
          <RawData payload={websocketData?.data} />
        ),
        style: panelStyle,
        extra: (
          <Button
            style={{ border: '1px solid #C6C6C6' }}
            color="default"
            variant="filled"
            icon={showPayloadTable ? <Code /> : <TableSplit />}
            onClick={() => setShowPayloadTable(!showPayloadTable)}
          />
        ),
      },
      ...(!isH5
        ? [
            {
              key: instanceInfo.dataType !== 6 ? 'dashboard' : '',
              label: formatMessage('uns.dashboard'),
              children: <Dashboard instanceInfo={instanceInfo} />,
              style: panelStyle,
              extra: [1, 2, 3].includes(instanceInfo.dataType) &&
                (!instanceInfo.withDashboard || !instanceInfo.dashboardIsExist) && (
                  <Button loading={createLoading} onClick={handleCreateDashboard}>
                    {formatMessage('common.create')}
                  </Button>
                ),
            },
            {
              key: [1, 2].includes(instanceInfo.dataType) ? 'topologyChart' : '',
              label: formatMessage('uns.topology'),
              children: (
                <TopologyChart instanceInfo={instanceInfo} payload={websocketData?.data} dt={websocketData?.dt || {}} />
              ),
              style: panelStyle,
            },
          ]
        : []),
      ...(!isH5
        ? [
            {
              id: 'sqlQuery',
              key: 'sqlQuery',
              label: formatMessage('uns.dataOperation'),
              children: <SqlQuery instanceInfo={instanceInfo} id={id as string} />,
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
            setActiveList={setActiveList}
            auth={ButtonPermission['uns.fileDetail']}
            alias={instanceInfo.alias}
            documentListRef={documentListRef}
          />
        ),
      },
    ];
    return items.filter((item: any) => item.key);
  };

  const handleCreateDashboard = () => {
    setCreateLoading(true);
    createDashboard(instanceInfo.alias)
      .then(() => {
        message.success(formatMessage('common.optsuccess'));
        getFileDetail(instanceInfo.id);
      })
      .finally(() => {
        setCreateLoading(false);
      });
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
        <Flex className="detailTitle" gap={8} align="center">
          <Document size={20} />
          <Title
            level={2}
            style={{ margin: 0, width: '100%', insetInlineStart: 0 }}
            editable={
              hasPermission(ButtonPermission['uns.fileDetail']) && systemInfo?.useAliasPathAsTopic
                ? {
                    icon: (
                      <Icon
                        data-button-auth={ButtonPermission['uns.fileDetail']}
                        component={FileEdit}
                        style={{
                          fontSize: 25,
                          color: 'var(--supos-text-color)',
                        }}
                      />
                    ),
                    onChange: (val) => {
                      if (val === instanceInfo.pathName || !val) return;
                      if (val.length > 63) {
                        return message.warning(
                          formatMessage('uns.labelMaxLength', { label: formatMessage('common.name'), length: 63 })
                        );
                      }
                      modifyModel({ id, name: val }).then(() => {
                        message.success(formatMessage('uns.editSuccessful'));
                        getFileDetail(id as string);
                        initTreeData({ queryType: 'editFileName' });
                      });
                    },
                  }
                : false
            }
          >
            {instanceInfo.pathName}
          </Title>
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
      </div>
    </div>
  );
};
export default Module;
