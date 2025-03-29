import { App, Button, Divider, Drawer, Flex, Form, Input, Select, TreeSelect } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslate } from '@/hooks';
import { AddAlt, Close, ConnectSource, SubtractAlt } from '@carbon/icons-react';
import { addTemplate, getTemplateDetail, getTreeData, getTypes } from '@/apis/inter-api/uns.ts';
import { noDuplicates } from '@/utils';
import styles from './index.module.scss';
const { SHOW_ALL } = TreeSelect;

const getSelectedNodes = (values: any, data: any) => {
  const _values = values?.map((item: any) => item.value);
  const result: any = [];
  const loop = (data: any) => {
    data.forEach((item: any) => {
      if (_values.includes(item.path)) {
        result.push(...(item?.fields || []));
      }
      if (item.children) {
        loop(item.children);
      }
    });
  };
  loop(data);
  return result;
};
const useTemplateModal = ({ successCallBack, changeCurrentPath, scrollTreeNode, setTreeMap }: any) => {
  const formatMessage = useTranslate();
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [showSource, setSource] = useState(false);
  const [form] = Form.useForm();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('addTemplate');
  const [treeData, setTreeData] = useState<any>([]);
  const treeValueList = useRef<any>([]);

  const openTemplateModal = (type: string, id: string) => {
    setType(type);
    setOpen(true);
    if (type === 'copyTemplate' && id) {
      getTemplateDetail({ id }).then((data: any) => {
        form.setFieldsValue({
          path: data?.path + '_Copy',
          fields: data?.fields,
          description: data?.description,
        });
      });
    } else {
      form.setFieldsValue({
        fields: [{}],
      });
    }
  };

  const onClose = () => {
    setSource(false);
    setOpen(false);
    form.resetFields();
  };

  useEffect(() => {
    getTypes().then((res: any) => {
      setTypes(res?.map?.((r: any) => ({ label: r, value: r })) || []);
    });
  }, [open]);
  const onSave = async () => {
    const values = await form.validateFields();
    const allowAddName = noDuplicates(values?.fields.map((e: any) => e.name));
    if (!allowAddName) {
      message.error(`${formatMessage('uns.thereAreDuplicate')}${formatMessage('uns.keyName')}`);
      return;
    }
    setLoading(true);
    addTemplate(values)
      .then((data: any) => {
        onClose();
        successCallBack?.({}, () => {
          changeCurrentPath({ path: data?.id, type: 1 });
          setTreeMap(false);
          scrollTreeNode(data?.id);
          message.success(formatMessage('common.optsuccess'));
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onSourceHandle = () => {
    setSource(true);
    getTreeData({}).then((res: any) => {
      setTreeData(res);
    });
  };

  const Dom = (
    <Drawer
      rootClassName={styles['template-modal']}
      title={formatMessage(`uns.${type}`)}
      open={open}
      closable={false}
      extra={<Close size={20} onClick={onClose} style={{ cursor: 'pointer' }} />}
      style={{
        backgroundColor: 'var(--supos-header-bg-color)',
        color: 'var(--supos-text-color)',
      }}
      maskClosable={false}
      destroyOnClose={false}
      width={680}
    >
      <div
        style={{
          '--cds-focus': 'var(--supos-theme-color)',
          '--cds-icon-primary': 'var(--supos-text-color)',
          '--cds-text-disabled': 'var(--supos-select-d-color)',
          '--cds-icon-disabled': 'var(--supos-select-d-color)',
        }}
      >
        <Form
          form={form}
          colon={false}
          style={{ color: 'var(--supos-text-color)' }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign="left"
          labelWrap
        >
          <Form.Item
            label={formatMessage('common.name')}
            name="path"
            rules={[
              {
                required: true,
                message: formatMessage('rule.required'),
              },
            ]}
          >
            <Input placeholder={formatMessage('common.name')} />
          </Form.Item>
          <Form.Item label={formatMessage('uns.templateDescription')} name="description">
            <Input.TextArea rows={2} placeholder={formatMessage('uns.templateDescription')} />
          </Form.Item>
          <Divider style={{ borderColor: '#c6c6c6' }} />
          <Flex className={styles['key-title']} justify="space-between" align="center">
            {formatMessage('uns.key')}

            <Button
              color="default"
              variant="filled"
              size="small"
              disabled={showSource}
              icon={<ConnectSource size={14} />}
              onClick={onSourceHandle}
              style={{
                color: !showSource ? 'var(--supos-text-color)' : 'var(--supos-select-d-color)',
                backgroundColor: !showSource ? '#C6C6C6' : 'var(--supos-uns-button-color)',
              }}
            >
              {formatMessage('uns.source')}
            </Button>
          </Flex>
          {!showSource ? (
            <Form.List name="fields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Flex key={key} gap="8px">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage('uns.pleaseInputKeyName'),
                          },
                          {
                            pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
                            message: formatMessage('uns.keyNameFormat'),
                          },
                        ]}
                        wrapperCol={{ span: 24 }}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder={formatMessage('common.name')} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage('uns.pleaseSelectKeyType'),
                          },
                        ]}
                        wrapperCol={{ span: 24 }}
                        style={{ flex: 0.7 }}
                      >
                        <Select placeholder={formatMessage('uns.type')} options={types} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'displayName']}
                        wrapperCol={{ span: 24 }}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder={`${formatMessage('uns.displayName')}(${formatMessage('uns.optional')})`} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'remark']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                        <Input placeholder={`${formatMessage('uns.remark')}(${formatMessage('uns.optional')})`} />
                      </Form.Item>
                      <Button
                        color="default"
                        variant="filled"
                        icon={<SubtractAlt />}
                        onClick={() => {
                          remove(name);
                        }}
                        style={{
                          border: '1px solid #CBD5E1',
                          color: 'var(--supos-text-color)',
                          backgroundColor: 'var(--supos-uns-button-color)',
                        }}
                        disabled={fields.length === 1}
                      />
                    </Flex>
                  ))}
                  <Button
                    color="default"
                    variant="filled"
                    onClick={() => {
                      add();
                      form.setFieldValue('functions', undefined);
                    }}
                    block
                    style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
                    icon={<AddAlt size={20} />}
                  />
                </>
              )}
            </Form.List>
          ) : (
            <>
              <TreeSelect
                popupClassName={styles['tree-select']}
                fieldNames={{ label: 'name', value: 'path' }}
                rootClassName={styles['tree-select-popup']}
                showSearch
                placeholder={formatMessage('common.select')}
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                allowClear
                multiple
                treeDefaultExpandAll
                treeCheckable
                treeCheckStrictly
                showCheckedStrategy={SHOW_ALL}
                treeNodeFilterProp="name"
                onChange={(value) => {
                  treeValueList.current = value;
                }}
                treeData={treeData}
              />

              <Flex justify="flex-end" align="center" gap={10} style={{ marginTop: 10 }}>
                <Button
                  color="default"
                  variant="filled"
                  size="small"
                  onClick={() => {
                    if (treeValueList.current?.length > 0) {
                      const newValue = getSelectedNodes(treeValueList.current, treeData);
                      form.setFieldValue('fields', [...form.getFieldValue('fields'), ...newValue]);
                      setSource(false);
                    } else {
                      message.error(formatMessage('common.select') + formatMessage('uns.source'));
                    }
                  }}
                  style={{ color: 'var(--supos-text-color)', backgroundColor: '#C6C6C6' }}
                >
                  {formatMessage('common.confirm')}
                </Button>
                <Button
                  color="default"
                  variant="filled"
                  size="small"
                  onClick={() => {
                    setSource(false);
                  }}
                  style={{ color: 'var(--supos-text-color)', backgroundColor: '#C6C6C6' }}
                >
                  {formatMessage('common.cancel')}
                </Button>
              </Flex>
            </>
          )}

          <Divider style={{ borderColor: '#c6c6c6' }} />
          <Flex justify="flex-end" align="center">
            <Button color="primary" variant="solid" size="small" onClick={onSave} loading={loading}>
              {formatMessage('common.save')}
            </Button>
          </Flex>
        </Form>
      </div>
    </Drawer>
  );
  return {
    TemplateModal: Dom,
    openTemplateModal,
  };
};

export default useTemplateModal;
