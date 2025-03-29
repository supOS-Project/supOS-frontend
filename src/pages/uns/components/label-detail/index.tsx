import { useState, useEffect, FC, CSSProperties } from 'react';
import _ from 'lodash';
import { getLabelDetail, getLabelPath, updateLabel, getLabelUnsId, deleteLabel } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';
import { Collapse, theme, Form, Flex, Button, Select, message, App, Typography } from 'antd';
import { CaretRight, Tag, Document } from '@carbon/icons-react';
import { AuthButton, AuthWrapper, ProModal, FileEdit } from '@/components';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { hasPermission } from '@/utils';
import Icon from '@ant-design/icons';

const { Paragraph } = Typography;

const panelStyle: CSSProperties = {
  background: 'val(--supos-bg-color)',
  border: 'none',
};

const Module: FC<any> = (props) => {
  const { labelDetailId, initTreeData } = props;
  const formatMessage = useTranslate();
  const [activeList, setActiveList] = useState<string[]>(['detail', 'definition', 'document']);
  const { token } = theme.useToken();
  const [topicTitle, setTopicTitle] = useState('');
  const [modelInfo, setModelInfo] = useState<any>({});
  const [isLabelVisible, setIsLabelVisible] = useState(false);
  const [labelPath, setLabelPath] = useState<any>();
  const [labelUnsId, setLabelUnsId] = useState();
  const [loading, setLoading] = useState(false);
  const { modal } = App.useApp();
  const [form] = Form.useForm();

  const getModel = (id: number) => {
    getLabelDetail(id)
      .then((data: any) => {
        setModelInfo(data);
        setTopicTitle(data?.labelName);
      })
      .catch(() => {});
  };
  const deleteRow = (id: any) => {
    const newFileVoList = modelInfo?.fileVoList?.filter((item: any) => item.unsId !== id);
    updateLabel({ ...modelInfo, fileVoList: newFileVoList }).then((res: any) => {
      if (res?.code === 200) {
        message.success(formatMessage('common.optsuccess'));
        getModel(labelDetailId);
        setIsLabelVisible(false);
      }
    });
  };
  useEffect(() => {
    if (labelDetailId) {
      getModel(labelDetailId);
    }
    getLabelPath()
      .then((res) => {
        setLabelPath(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [labelDetailId]);

  const onSave = async () => {
    const values = await form.validateFields();
    if (values) {
      setLoading(true);
      updateLabel({
        id: modelInfo?.id,
        labelName: modelInfo?.labelName,
        fileVoList: _.concat(modelInfo.fileVoList || [], [{ ...values, unsId: labelUnsId }]),
      })
        .then((res: any) => {
          if (res?.code === 200) {
            message.success(formatMessage('common.optsuccess'));
            getModel(labelDetailId);
            setIsLabelVisible(false);
            form.resetFields();
            setLoading(false);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };
  const handleAdd = () => {
    setIsLabelVisible(true);
  };

  const handleSelectChange = (value: any) => {
    getLabelUnsId(value).then((res: any) => setLabelUnsId(res?.id));
  };

  const onDeleteHandle = () => {
    modal.confirm({
      content: formatMessage('common.deleteConfirm'),
      cancelText: formatMessage('common.cancel'),
      okText: formatMessage('common.confirm'),
      onOk() {
        deleteLabel(labelDetailId).then((res: any) => {
          if (res?.code === 200) {
            initTreeData({ reset: true });
            message.success(formatMessage('common.deleteSuccessfully'));
          }
        });
      },
    });
  };

  const items = [
    {
      key: 'definition',
      label: formatMessage('uns.fileList'),
      children: (
        <>
          <table className="customTable" border={1} cellSpacing="1">
            <thead>
              <tr>
                <td style={{ width: '47%' }}>{formatMessage('common.name')}</td>
                <td style={{ width: '47%' }}>{formatMessage('uns.position')}</td>
                <td className="no-border-td"></td>
              </tr>
            </thead>
            <tbody>
              {(modelInfo?.fileVoList || []).map((e: any) => (
                <tr key={e.unsId}>
                  <td>
                    <Document style={{ marginRight: 5, verticalAlign: 'middle' }} />
                    {e.name}
                  </td>
                  <td>{e.path}</td>
                  <td className="no-border-td">
                    <AuthButton
                      auth={ButtonPermission['label.fileDel']}
                      className="no-border-td-button"
                      onClick={() => deleteRow(e.unsId)}
                      color="default"
                      variant="filled"
                      style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
                    >
                      —
                    </AuthButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AuthButton
            auth={ButtonPermission['label.fileAdd']}
            className="button-add"
            onClick={handleAdd}
            color="default"
            variant="filled"
            style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
          >
            +
          </AuthButton>
        </>
      ),
      style: panelStyle,
    },
  ];

  const selectOptions = labelPath?.map((e: any) => {
    return {
      value: e,
      label: e,
    };
  });
  selectOptions?.forEach((itemOne: any) => {
    const match = modelInfo?.fileVoList?.some((itemTwo: any) => itemOne.value === itemTwo.path);
    itemOne.disabled = match;
  });
  return (
    <div className="topicDetailWrap">
      <div className="topicDetailContent">
        <Flex className="detailTitle" gap={8} justify="flex-start" align="center">
          <Tag style={{ transform: 'rotate(90deg)' }} size={20} />
          <Paragraph
            style={{ margin: 0, width: '100%', insetInlineStart: 0, fontSize: 30, lineHeight: 1 }}
            editable={
              hasPermission(ButtonPermission['label.editName'])
                ? {
                    icon: (
                      <Icon
                        data-button-auth={ButtonPermission['label.editName']}
                        component={FileEdit}
                        style={{
                          fontSize: 25,
                          color: '#5A5A5A',
                          marginLeft: 5,
                        }}
                      />
                    ),
                    onChange: (val) => {
                      updateLabel({
                        id: labelDetailId,
                        labelName: val,
                      }).then(() => {
                        message.success(formatMessage('uns.editSuccessful'));
                        getModel(labelDetailId);
                        initTreeData?.({});
                      });
                    },
                  }
                : false
            }
          >
            {topicTitle}
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
        <AuthWrapper auth={ButtonPermission['label.delete']}>
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
      <ProModal
        title={formatMessage('uns.newFile')}
        className="labelModalWrap"
        open={isLabelVisible}
        onCancel={() => {
          setIsLabelVisible(false);
          form.resetFields();
        }}
        size="xxs"
      >
        <Form colon={false} name="labelForm" disabled={loading} form={form}>
          <Form.Item
            label={formatMessage('uns.position')}
            name="path"
            style={{ marginBottom: 15 }}
            rules={[
              {
                required: true,
                message: formatMessage('rule.required'),
              },
            ]}
          >
            <Select onChange={handleSelectChange} options={selectOptions} popupMatchSelectWidth={400} />
          </Form.Item>
        </Form>
        <div style={{ marginTop: '20px' }}>
          <Button
            style={{ width: '48%', marginRight: '4%' }}
            size="large"
            color="default"
            variant="filled"
            disabled={loading}
            onClick={() => {
              setIsLabelVisible(false);
              form.resetFields();
              setLoading(false);
            }}
          >
            {formatMessage('common.cancel')}
          </Button>

          <Button
            className="labelConfirm"
            size="large"
            style={{ width: '48%' }}
            onClick={onSave}
            color="primary"
            loading={loading}
            variant="solid"
          >
            {formatMessage('common.save')}
          </Button>
        </div>
      </ProModal>
    </div>
  );
};
export default Module;
