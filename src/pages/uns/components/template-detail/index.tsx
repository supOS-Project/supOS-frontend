import { CSSProperties, FC, useEffect, useState } from 'react';
import { CaretRight, Document, Folder, WatsonHealth3DMprToggle } from '@carbon/icons-react';
import { App, Button, Collapse, Flex, theme, Typography } from 'antd';
import { useTranslate } from '@/hooks';
import { AuthWrapper, ComDetailList, FileEdit } from '@/components';
import Icon from '@ant-design/icons';
import EditButton from '@/pages/uns/components/EditButton.tsx';
import { editModel, editTemplateName, getTemplateDetail } from '@/apis/inter-api/uns.ts';
import { formatTimestamp, hasPermission } from '@/utils';
import { ButtonPermission } from '@/common-types/button-permission.ts';
const { Paragraph } = Typography;

interface TemplateDetailProps {
  // id
  currentPath: string;
  setDeleteOpen?: any;
  initTreeData?: any;
}

const panelStyle: CSSProperties = {
  background: 'val(--supos-bg-color)',
  border: 'none',
};

const TemplateDetail: FC<TemplateDetailProps> = ({ currentPath, setDeleteOpen, initTreeData }) => {
  const [activeList, setActiveList] = useState<string[]>(['detail', 'definition', 'fileList']);
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [info, setInfo] = useState<any>({});
  const formatMessage = useTranslate();

  const onDeleteHandle = () => {
    setDeleteOpen(currentPath);
  };

  const getModel = (id: string) => {
    if (!id) return;
    getTemplateDetail({ id }).then((data) => {
      setInfo(data);
    });
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
        <ComDetailList
          list={[
            {
              label: formatMessage('uns.description'),
              key: 'description',
              render: (item, modelInfo: any) => (
                <Paragraph
                  style={{ margin: 0, width: '100%' }}
                  editable={
                    hasPermission(ButtonPermission['template.editDescription'])
                      ? {
                          icon: (
                            <Icon
                              data-button-auth={ButtonPermission['template.editDescription']}
                              component={FileEdit}
                              style={{
                                fontSize: 17,
                                color: 'var(--supos-text-color)',
                              }}
                            />
                          ),
                          onChange: (val) => {
                            editModel({ alias: modelInfo.alias, modelDescription: val }).then(() => {
                              message.success(formatMessage('uns.editSuccessful'));
                              getModel(currentPath);
                            });
                          },
                        }
                      : false
                  }
                >
                  {item}
                </Paragraph>
              ),
            },
            {
              label: formatMessage('common.creationTime'),
              key: 'createTime',
              render: (item) => formatTimestamp(item),
            },
          ]}
          data={info}
        />
      ),
      style: panelStyle,
    },
    {
      key: 'definition',
      label: <span>{formatMessage('uns.definition')}</span>,
      extra: (
        <EditButton
          auth={ButtonPermission['template.definition']}
          modelInfo={info}
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
            {(info?.fields || []).map((e: any) => (
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
      key: 'fileList',
      label: <span>{formatMessage('common.fileList')}</span>,
      children: (
        <table className="customTable" border={1} cellSpacing="1">
          <thead>
            <tr>
              <td style={{ width: '25%' }}>{formatMessage('common.name')}</td>
              <td style={{ width: '75%' }}>{formatMessage('uns.position')}</td>
            </tr>
          </thead>
          <tbody>
            {(info?.fileList || []).map((e: any, index: number) => (
              <tr key={e.name + index}>
                <td>
                  {e.pathType === 0 ? (
                    <Folder style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  ) : (
                    <Document
                      style={{
                        marginRight: 5,
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                  {e.name}
                </td>
                <td style={{ color: 'var(--supos-table-first-color)' }}>{e.path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
      style: panelStyle,
    },
  ];

  return (
    <div className="topicDetailWrap">
      <div className="topicDetailContent">
        <Flex className="detailTitle" gap={8} justify="flex-start" align="center">
          <WatsonHealth3DMprToggle size={30} />
          <Paragraph
            style={{ margin: 0, width: '100%', insetInlineStart: 0, fontSize: 30, lineHeight: 1 }}
            editable={
              hasPermission(ButtonPermission['template.editName'])
                ? {
                    icon: (
                      <Icon
                        data-button-auth={ButtonPermission['template.editName']}
                        component={FileEdit}
                        style={{
                          fontSize: 25,
                          color: '#5A5A5A',
                          marginLeft: 5,
                        }}
                      />
                    ),
                    onChange: (val) => {
                      editTemplateName(currentPath, val).then(() => {
                        message.success(formatMessage('uns.editSuccessful'));
                        getModel(currentPath);
                        initTreeData?.({});
                      });
                    },
                  }
                : false
            }
          >
            {info?.path}
          </Paragraph>
        </Flex>
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
        <AuthWrapper auth={ButtonPermission['template.delete']}>
          <div className="deleteBtnWrap">
            <Button
              type="primary"
              style={{
                width: '100px',
                fontWeight: 'bold',
              }}
              onClick={onDeleteHandle}
            >
              {formatMessage('common.delete')}
            </Button>
          </div>
        </AuthWrapper>
      </div>
    </div>
  );
};

export default TemplateDetail;
