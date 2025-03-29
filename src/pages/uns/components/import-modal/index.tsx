import { FC, useState, useEffect, useRef } from 'react';
import { FolderAdd, Download } from '@carbon/icons-react';
import { Upload, Button, App } from 'antd';
import { importExcel } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';
import { ProModal, InlineLoading } from '@/components';

import { useWebSocket } from 'ahooks';

import './index.scss';

const { Dragger } = Upload;
const { confirm } = ProModal;

const Module: FC<any> = (props) => {
  const { importModal, setImportModal, initTreeData, type, query } = props;
  const formatMessage = useTranslate();
  const { message } = App.useApp();
  const timer: any = useRef(null);
  const uploadRef = useRef<any>(null);

  const [fileList, setFileList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [socketData, setSocketData] = useState<any>({});
  const [socketUrl, setSocketUrl] = useState('');

  // 创建 WebSocket 连接
  const { readyState, disconnect, sendMessage } = useWebSocket(
    socketUrl, // 初始 URL 为 null，表示不立即连接
    {
      reconnectLimit: 0,
      onMessage: (event) => {
        if (event.data === 'pong') return;
        const data = JSON.parse(event.data);
        setSocketData(data);
        if (data.finished) initTreeData({ reset: true, query, type });
      },
      onError: (error) => console.error('WebSocket error:', error),
    }
  );

  const beforeUpload = (file: any) => {
    const fileType = file.name.split('.').pop();
    if (['xlsx'].includes(fileType)) {
      setFileList([file]);
    } else {
      message.warning(formatMessage('uns.theFileFormatOnlySupportsXlsx'));
    }
    return false;
  };

  const save = () => {
    if (fileList.length) {
      setLoading(true);
      importExcel({
        value: fileList[0],
        name: 'file',
        fileName: fileList[0].name,
      })
        .then((data: any) => {
          if (data) {
            const protocol = location.protocol.includes('https') ? 'wss' : 'ws';
            // 创建 WebSocket 连接
            setSocketUrl(`${protocol}://${location.host}/inter-api/supos/uns/ws?file=${encodeURIComponent(data)}`);
          }
        })
        .catch(() => {
          resetUploadStatus();
        });
    } else {
      message.warning(formatMessage('uns.pleaseUploadTheFile'));
    }
  };

  const close = () => {
    setImportModal(false);
    setFileList([]);
    if (socketData.finished) {
      resetUploadStatus();
    }
  };

  const resetUploadStatus = () => {
    setLoading(false);
    setSocketUrl('');
    setSocketData({});
    setFileList([]);
  };

  const Reupload = () => {
    resetUploadStatus();
    setTimeout(() => {
      if (uploadRef.current) uploadRef.current.nativeElement.querySelector('input').click();
    });
  };

  useEffect(() => {
    if (socketData.finished && disconnect) {
      disconnect();
      clearInterval(timer.current);
      if (socketData.code === 200) {
        // message.success(formatMessage('uns.importFinished'));
        setTimeout(() => {
          close();
        }, 3000);
      }
    }
    if (socketData.code === 206) {
      confirm({
        title: formatMessage('uns.PartialDataImportFailed'),
        onOk() {
          window.open(`/inter-api/supos/uns/excel/download?path=${socketData.errTipFile}`, '_self');
        },
      });
    }
  }, [socketData]);

  useEffect(() => {
    if (readyState === 1) {
      timer.current = setInterval(() => {
        if (sendMessage && readyState === 1) {
          sendMessage('ping');
        } else {
          clearInterval(timer.current);
        }
      }, 30000);
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [readyState]);

  useEffect(() => {
    return () => {
      if (disconnect) {
        disconnect();
      }
      clearInterval(timer.current);
    };
  }, []);

  const reimport = socketData.finished && socketData.code !== 200;

  return (
    <ProModal
      aria-label=""
      className="importModalWrap"
      open={importModal}
      onCancel={close}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{formatMessage('common.import')}</span>
          <a download="template" href="/inter-api/supos/uns/excel/template/download">
            <Button
              color="default"
              variant="filled"
              icon={<Download />}
              iconPosition="end"
              style={{ padding: '4px 10px', color: 'var(--supos-text-color) !important' }}
            >
              {formatMessage('common.downloadTemplate')}
            </Button>
          </a>
        </div>
      }
      width={460}
      maskClosable={false}
      keyboard={false}
    >
      {loading ? (
        <div className="loadingWrap">
          <InlineLoading
            status={socketData.finished ? (socketData.code === 200 ? 'finished' : 'error') : 'active'}
            description={`${socketData.finished ? socketData.msg : socketData.task || ''}(${socketData.progress || 0}%)`}
          />
        </div>
      ) : (
        <>
          <Dragger
            ref={uploadRef}
            className="uploadWrap"
            action=""
            accept=".xlsx"
            maxCount={1}
            beforeUpload={beforeUpload}
            fileList={fileList}
            onRemove={() => {
              setFileList([]);
            }}
          >
            <FolderAdd size={100} style={{ color: '#E0E0E0' }} />
          </Dragger>
        </>
      )}
      <Button
        color="primary"
        variant="solid"
        onClick={reimport ? Reupload : save}
        block
        style={{ marginTop: '10px' }}
        loading={reimport ? false : loading}
        disabled={reimport ? false : loading}
      >
        {formatMessage(reimport ? 'uns.reimport' : 'common.save')}
      </Button>
    </ProModal>
  );
};
export default Module;
