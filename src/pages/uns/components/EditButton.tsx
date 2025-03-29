import { useState, useEffect } from 'react';
import { Button, Flex, App, Form, Input, Select } from 'antd';
import { AddAlt, SubtractAlt } from '@carbon/icons-react';
import { AuthButton, ProModal, FileEdit } from '@/components';
import { useTranslate } from '@/hooks';
import { getTypes, detectModel, editModel } from '@/apis/inter-api/uns';
import Icon from '@ant-design/icons';
import { noDuplicates } from '@/utils';

const EditButton = ({ modelInfo, getModel, auth }: any) => {
  const { alias, fields = [] } = modelInfo || {};
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const formatMessage = useTranslate();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [types, setTypes] = useState([]);
  const [mainKey, setMainKey] = useState<any>(undefined);
  const [closeClass, setCloseClass] = useState(false);
  const fieldList = Form.useWatch('fields', form) || [];

  const onClose = () => {
    setShow(false);
  };

  const editRequest = (fields: any) => {
    setLoading(true);
    editModel({ alias, fields })
      .then(() => {
        message.success(formatMessage('uns.editSuccessful'));
        setLoading(false);
        onClose();
        getModel();
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onSave = () => {
    if (fieldList.length === 0) {
      return message.error(formatMessage('uns.pleaseEnterAtLeastOneAttribute'));
    }
    const allowAddName = noDuplicates(fieldList.map((e: any) => e.name));
    if (!allowAddName) {
      message.error(`${formatMessage('uns.thereAreDuplicate')}${formatMessage('uns.keyName')}`);
      return;
    }
    form
      .validateFields()
      .then((values) => {
        setCloseClass(true);
        const _fields = values.fields.map(({ name, type, displayName, remark }: any) => {
          return { name, type, displayName, remark };
        });

        detectModel({
          alias,
          fields: _fields,
        }).then((res: any) => {
          if (res && res.referred) {
            modal.confirm({
              content: res.tips,
              cancelText: formatMessage('common.cancel'),
              okText: formatMessage('common.confirm'),
              zIndex: 9001,
              onOk() {
                editRequest(_fields);
              },
              onCancel() {},
              afterClose: () => {
                setCloseClass(false);
              },
            });
          } else {
            editRequest(_fields);
          }
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (show) {
      getTypes()
        .then((res: any) => {
          setTypes(res ? res.map((type: any) => ({ label: type, value: type })) : []);
        })
        .catch((err) => {
          console.log(err);
        });
      form.setFieldsValue({ fields: fields?.map((field: any) => ({ ...field, readOnly: true })) });
      setMainKey(fields?.findIndex((field: any) => field.unique));
    }
  }, [show]);

  return (
    <>
      <AuthButton
        auth={auth}
        onClick={() => setShow(true)}
        style={{ border: '1px solid #C6C6C6', background: 'var(--supos-uns-button-color)' }}
        icon={
          <Icon
            component={FileEdit}
            style={{
              fontSize: 17,
              color: 'var(--supos-text-color)',
            }}
          />
        }
      />
      <ProModal
        aria-label=""
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{formatMessage('common.edit')}</span>
          </div>
        }
        onCancel={onClose}
        open={show}
        className={`editModalWrap ${closeClass ? 'information-modal-close' : ''}`}
        width={720}
      >
        <Form form={form} name="editModelForm" colon={false} initialValues={{ fields: fields }} disabled={loading}>
          <Form.List name="fields">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Flex key={key} gap="8px">
                    {fieldList[index]?.readOnly ? (
                      <div
                        className="readOnlyField"
                        style={{
                          flex: 1,
                          minHeight: 32,
                          marginBottom: 24,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          borderBottom: '1px solid var(--supos-table-tr-color)',
                          wordBreak: 'break-all',
                        }}
                      >
                        <span style={{ flex: 1 }}>{fieldList[index]?.name}</span>
                        <span style={{ flex: 0.7 }}>{fieldList[index]?.type}</span>
                        <span style={{ flex: 1 }}>{fieldList[index]?.displayName}</span>
                        <span style={{ flex: 1 }}>{fieldList[index]?.remark}</span>
                      </div>
                    ) : (
                      <>
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
                          <Select
                            placeholder={formatMessage('uns.type')}
                            onChange={(type) => {
                              if (index === mainKey && !['int', 'long', 'string'].includes(type)) {
                                setMainKey(undefined);
                              }
                            }}
                            options={types}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'displayName']}
                          wrapperCol={{ span: 24 }}
                          style={{ flex: 1 }}
                        >
                          <Input
                            placeholder={`${formatMessage('uns.displayName')}(${formatMessage('uns.optional')})`}
                          />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'remark']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                          <Input placeholder={`${formatMessage('uns.remark')}(${formatMessage('uns.optional')})`} />
                        </Form.Item>
                      </>
                    )}
                    <Button
                      color="default"
                      variant="filled"
                      icon={<SubtractAlt />}
                      onClick={() => {
                        remove(name);
                        if (mainKey === index) {
                          setMainKey(undefined);
                        }
                      }}
                      style={{
                        border: '1px solid #CBD5E1',
                        color: 'var(--supos-text-color)',
                        backgroundColor: 'var(--supos-uns-button-color)',
                      }}
                    />
                  </Flex>
                ))}

                <Button
                  color="default"
                  variant="filled"
                  onClick={() => {
                    add();
                  }}
                  block
                  style={{
                    color: 'var(--supos-text-color)',
                    backgroundColor: 'var(--supos-uns-button-color)',
                  }}
                  icon={<AddAlt size={20} />}
                />
              </>
            )}
          </Form.List>
        </Form>
        <Button loading={loading} color="primary" variant="solid" block onClick={onSave} style={{ marginTop: 20 }}>
          {formatMessage('common.save')}
        </Button>
      </ProModal>
    </>
  );
};

export default EditButton;
