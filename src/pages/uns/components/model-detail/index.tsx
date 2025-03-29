import { useState, useEffect, FC, CSSProperties, useRef } from 'react';
import { getModelInfo, editModel } from '@/apis/inter-api/uns';
import FloatTreemap from '@/pages/uns/components/FloatTreemap';
import { formatTimestamp, hasPermission } from '@/utils';
import { useTranslate } from '@/hooks';
import { Collapse, App, theme, Typography } from 'antd';
import { CaretRight, Folder } from '@carbon/icons-react';
import DocumentList from '@/pages/uns/components/DocumentList.tsx';
import UploadButton from '@/pages/uns/components/UploadButton.tsx';
import EditButton from '@/pages/uns/components/EditButton.tsx';
import Icon from '@ant-design/icons';
import { FileEdit } from '@/components';
import { ButtonPermission } from '@/common-types/button-permission.ts';
const { Paragraph } = Typography;

const panelStyle: CSSProperties = {
  background: 'val(--supos-bg-color)',
  border: 'none',
};

const Module: FC<any> = (props) => {
  const { message } = App.useApp();
  const { currentPath, treeData, changeCurrentPath, nodeValue } = props;
  const documentListRef = useRef();
  const formatMessage = useTranslate();
  const [activeList, setActiveList] = useState<string[]>(['detail', 'definition', 'document']);
  const { token } = theme.useToken();

  const [modelInfo, setModelInfo] = useState<any>({});
  const [open, setOpen] = useState(false);

  const getModel = (topic: any) => {
    getModelInfo({ topic })
      .then((data: any) => {
        setModelInfo(data || {});
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (currentPath) {
      getModel(currentPath);
    }
  }, [currentPath]);

  const items = [
    {
      key: 'detail',
      label: <span>{formatMessage('common.detail')}</span>,
      children: (
        <>
          <div className="detailItem">
            <div className="detailKey"> {formatMessage('uns.alias')}</div>
            <div>{modelInfo.alias}</div>
          </div>
          <div className="detailItem">
            <div className="detailKey"> {formatMessage('uns.description')}</div>
            <div style={{ width: '70%' }}>
              <Paragraph
                style={{ margin: 0, width: '100%' }}
                editable={
                  hasPermission(ButtonPermission['uns.editFolderDescription'])
                    ? {
                        icon: (
                          <Icon
                            data-button-auth={ButtonPermission['uns.editFolderDescription']}
                            component={FileEdit}
                            style={{
                              fontSize: 17,
                              color: 'var(--supos-text-color)',
                            }}
                          />
                        ),
                        onChange: (val) => {
                          console.log(val);
                          editModel({ alias: modelInfo.alias, modelDescription: val }).then(() => {
                            message.success(formatMessage('uns.editSuccessful'));
                            getModel(currentPath);
                          });
                        },
                      }
                    : false
                }
              >
                {modelInfo.description}
              </Paragraph>
            </div>
          </div>
          <div className="detailItem">
            <div className="detailKey"> {formatMessage('uns.referenceTemplate')}</div>
            <div>{modelInfo.modelName}</div>
          </div>
          <div className="detailItem">
            <div className="detailKey">{formatMessage('common.creationTime')}</div>
            <div>{formatTimestamp(modelInfo.createTime)}</div>
          </div>
          <div className="detailItem">
            <div className="detailKey">{formatMessage('uns.namespace')}</div>
            <div>{modelInfo.topic}</div>
          </div>
          <div className="detailItem">
            <div className="detailKey">{formatMessage('uns.instanceCountStatistics')}</div>
            <div>{nodeValue}</div>
          </div>
        </>
      ),
      style: panelStyle,
    },
    {
      key: 'definition',
      label: formatMessage('uns.definition'),
      extra: (
        <EditButton
          auth={ButtonPermission['uns.definition']}
          modelInfo={modelInfo}
          getModel={() => getModel(currentPath)}
        />
      ),
      children: (
        <table className="customTable" border={1} cellSpacing="1">
          <thead>
            <tr>
              <td style={{ width: '25%' }}>{formatMessage('common.name')}</td>
              <td style={{ width: '25%' }}>{formatMessage('uns.type')}</td>
              <td style={{ width: '25%' }}>{formatMessage('uns.displayName')}</td>
              <td style={{ width: '25%' }}>{formatMessage('uns.remark')}</td>
            </tr>
          </thead>
          <tbody>
            {(modelInfo?.fields || []).map((e: any) => (
              <tr key={e.name}>
                <td>{e.name}</td>
                <td>{e.type}</td>
                <td>{e.displayName}</td>
                <td>{e.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
      style: panelStyle,
    },
    {
      key: 'document',
      label: formatMessage('common.document'),
      children: <DocumentList alias={modelInfo.alias} ref={documentListRef} />,
      style: panelStyle,
      extra: (
        <UploadButton
          auth={ButtonPermission['uns.uploadDoc']}
          alias={modelInfo.alias}
          documentListRef={documentListRef}
        />
      ),
    },
  ];
  return (
    <div className="topicDetailWrap">
      <div
        className="topicDetailContent"
        style={{ paddingBottom: treeData.length > 0 ? (open ? '670px' : '70px') : '20px' }}
      >
        <div className="detailTitle">
          <Folder
            size={20}
            style={{
              marginRight: '8px',
            }}
          />
          {modelInfo.name}
        </div>
        <div className="tableWrap">
          <Collapse
            bordered={false}
            collapsible="header"
            activeKey={activeList}
            onChange={(even) => setActiveList(even)}
            expandIcon={({ isActive }) => (
              <CaretRight
                size={20}
                style={{
                  rotate: isActive ? '90deg' : '0deg',
                  transition: '200ms',
                }}
              />
            )}
            items={items}
            style={{ background: token.colorBgContainer }}
          />
        </div>
      </div>
      {treeData.length > 0 && (
        <FloatTreemap treeData={treeData} changeCurrentPath={changeCurrentPath} open={open} setOpen={setOpen} />
      )}
    </div>
  );
};
export default Module;
