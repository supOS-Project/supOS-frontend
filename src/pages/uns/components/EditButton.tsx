import { useState, useEffect } from 'react';
import { Button, Flex, App, Form, Input, Select, InputNumber } from 'antd';
import { AddAlt, SubtractAlt } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import { getTypes, detectModel, editModel } from '@/apis/inter-api/uns';
import Icon from '@ant-design/icons';

import type { FieldItem } from '@/pages/uns/types';
import { AuthButton } from '@/components/auth';
import ProModal from '@/components/pro-modal';
import FileEdit from '@/components/svg-components/FileEdit';

const EditButton = ({ modelInfo, getModel, auth, editType }: any) => {
  const { alias, fields = [] } = modelInfo || {};
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const formatMessage = useTranslate();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [types, setTypes] = useState([]);
  const fieldList = Form.useWatch('fields', form) || [];

  const onClose = () => {
    setShow(false);
  };

  const editRequest = (fields: FieldItem[]) => {
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

  //重复键名校验
  const validateUnique = (_: any, value: string) => {
    const values = form.getFieldValue('fields') || []; // 获取所有表单项的值
    const isDuplicate = value && values.filter((item: FieldItem) => item?.name === value).length > 1; // 检查是否有重复值

    if (isDuplicate) {
      return Promise.reject(new Error(formatMessage('uns.duplicateKeyNameTip')));
    } else {
      return Promise.resolve();
    }
  };

  const triggerNameFieldValidation = () => {
    const currentNames = form.getFieldValue('fields');
    if (!Array.isArray(currentNames)) return;

    const fieldsToValidate = currentNames.map((_, i) => ['fields', i, 'name']);
    setTimeout(() => {
      form.validateFields(fieldsToValidate).catch(() => {});
    }, 0);
  };

  const onSave = () => {
    if (fieldList.length === 0 && editType === 'template') {
      return message.error(formatMessage('uns.pleaseEnterAtLeastOneAttribute'));
    }

    form
      .validateFields()
      .then((values) => {
        const _fields =
          values?.fields?.map(({ name, type, displayName, remark, maxLen }: FieldItem) => {
            return { name, type, displayName, remark, maxLen };
          }) || [];

        detectModel({
          alias,
          fields: _fields,
        }).then((res: any) => {
          if (res && res.referred) {
            modal.confirm({
              content: res.tips,
              zIndex: 9001,
              onOk() {
                editRequest(_fields);
              },
              onCancel() {},
              okButtonProps: {
                title: formatMessage('common.confirm'),
              },
              cancelButtonProps: {
                title: formatMessage('common.cancel'),
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
          setTypes(res ? res.map((type: string) => ({ label: type, value: type })) : []);
        })
        .catch((err) => {
          console.log(err);
        });
      form.setFieldsValue({ fields: fields?.map((field: FieldItem) => ({ ...field, readOnly: true })) });
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
        className="editModalWrap"
        width={720}
        styles={{
          content: { padding: 0 },
          header: { padding: '20px 24px 10px', margin: 0 },
          body: { padding: '0 24px 30px', margin: 0, maxHeight: 'calc(100vh - 62px)', overflowY: 'auto' },
        }}
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
                        <span style={{ width: '110px' }}>{fieldList[index]?.type}</span>
                        <span style={{ flex: 1 }}>{fieldList[index]?.maxLen}</span>
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
                            { validator: validateUnique }, // 添加自定义校验规则
                            {
                              max: 63,
                              message: formatMessage('uns.labelMaxLength', {
                                label: formatMessage('common.name'),
                                length: 63,
                              }),
                            },
                          ]}
                          wrapperCol={{ span: 24 }}
                          style={{ flex: 1 }}
                        >
                          <Input
                            placeholder={formatMessage('common.name')}
                            title={fieldList?.[index]?.name || formatMessage('common.name')}
                            onChange={triggerNameFieldValidation}
                          />
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
                          style={{ width: '110px' }}
                        >
                          <Select
                            placeholder={formatMessage('uns.type')}
                            title={fieldList?.[index]?.type || formatMessage('uns.type')}
                            options={types}
                            onChange={(type) => {
                              if (type.toLowerCase() !== 'string') {
                                form.setFieldValue(['fields', index, 'maxLen'], undefined);
                              }
                            }}
                          />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'maxLen']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                          <InputNumber
                            disabled={fieldList?.[index]?.type?.toLowerCase() !== 'string'}
                            style={{ width: '100%' }}
                            min={1}
                            max={10485760}
                            step={1}
                            precision={0}
                            placeholder={formatMessage('common.length')}
                            title={fieldList?.[index]?.maxLen || formatMessage('common.length')}
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
                            title={
                              fieldList?.[index]?.displayName ||
                              `${formatMessage('uns.displayName')}(${formatMessage('uns.optional')})`
                            }
                          />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'remark']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                          <Input
                            placeholder={`${formatMessage('uns.remark')}(${formatMessage('uns.optional')})`}
                            title={
                              fieldList?.[index]?.remark ||
                              `${formatMessage('uns.remark')}(${formatMessage('uns.optional')})`
                            }
                          />
                        </Form.Item>
                      </>
                    )}
                    <Button
                      color="default"
                      variant="filled"
                      icon={<SubtractAlt />}
                      onClick={() => {
                        remove(name);
                        triggerNameFieldValidation();
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
