import { FC, useEffect, useState } from 'react';
import { attempt, isEmpty, isError, map } from 'lodash';
import { useWebSocket } from 'ahooks';
import { formatTimestamp, isJsonString } from '@/utils';
import { Copy } from '@carbon/icons-react';
import Clipboard from 'clipboard';
import { useTranslate } from '@/hooks';
import { Button, Empty, message, Tooltip } from 'antd';
import { ClearOutlined } from '@ant-design/icons';

interface IProps {
  topic: string;
  showType: number | null;
}

const RealTimeData: FC<IProps> = ({ topic, showType }) => {
  const formatMessage = useTranslate();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [socketUrl, setSocketUrl] = useState<string>('');

  useEffect(() => {
    // 复制
    const nodeList: any = document.getElementsByClassName('realTimeList-copy');
    if (nodeList.length === 0) return;

    const clipboard = new Clipboard(nodeList);

    clipboard.on('success', () => {
      message.success(formatMessage('common.copySuccess'));
    });

    clipboard.on('error', () => {
      console.error('Failed to copy text');
    });

    return () => {
      clipboard.destroy(); // 清除事件监听和实例
    };
  }, [dataSource]);
  const { webSocketIns } = useWebSocket(socketUrl, {
    reconnectLimit: 0,
    onMessage: (event) => {
      const dataJson = event.data;
      if (isJsonString(dataJson)) {
        const data = JSON.parse(dataJson);
        if (!isEmpty(data)) {
          if (!isJsonString(data.payload)) {
            data.payload = 'null';
          }
          // 最多保留100条
          let newSource = [...dataSource, data];
          if (newSource.length > 100) {
            newSource = newSource.slice(-100);
          }
          setDataSource(newSource);
        }
      }
    },
    onError: (error) => console.error('WebSocket error:', error),
  });

  useEffect(() => {
    setDataSource([]);
    if (showType === 2) {
      setSocketUrl(
        `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/inter-api/supos/uns/ws?topic=${encodeURIComponent(topic)}`
      );
    } else {
      setSocketUrl('');
      webSocketIns?.close();
    }
  }, [topic, showType]);

  const topicFileName = topic.split('/').slice(-1)[0];

  return (
    <div className="unsRealTimeWrap">
      {topicFileName ? (
        <>
          <h3
            style={{
              fontSize: '30px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            {topicFileName}
            <Tooltip title={formatMessage('uns.clearMsg')}>
              <Button
                icon={<ClearOutlined />}
                color="default"
                variant="filled"
                onClick={() => {
                  setDataSource([]);
                }}
              ></Button>
            </Tooltip>
          </h3>
          <div className="realTimeData">
            {dataSource.length > 0 ? (
              map(dataSource, ({ payload, updateTime }) => {
                return (
                  <div key={updateTime}>
                    <div className="realTimeDataPanel">
                      <div style={{ overflow: 'auto', padding: '16px', maxHeight: '400px' }}>
                        {isError(attempt(JSON.parse, payload)) ? (
                          payload
                        ) : (
                          <pre>{JSON.stringify(JSON.parse(payload), null, 2)}</pre>
                        )}
                      </div>
                      <div className="realTimeList-copy-overlap">
                        <div className="realTimeList-copy" data-clipboard-text={payload}>
                          <Copy />
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: '7px 0 0', lineHeight: '16px', fontSize: '12px' }}>
                      {formatTimestamp(updateTime)}
                    </p>
                  </div>
                );
              })
            ) : (
              <Empty description={false} style={{ marginTop: '120px' }} />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
export default RealTimeData;
