import { useEffect, useState } from 'react';
import { useTranslate } from '@/hooks';
import { App, Button, Col, Form, Input, Row } from 'antd';
import { createUser, getRoleList, updateUser } from '@/apis/inter-api/user-manage';
import styles from './RoleSetting.module.scss';
import ComSelect from '@/components/com-select';
import ProModal from '@/components/pro-modal';
import { validNameRegex, phoneRegex, passwordRegex } from '@/utils/pattern';

const useAddUser = ({ onSaveBack }: any) => {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [options, setOptions] = useState([]);
  const [form] = Form.useForm();
  const formatMessage = useTranslate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getRoleList().then((data: any) => {
        setOptions(
          data?.map((d: any) => ({
            label: d?.roleName,
            value: d?.roleId,
          }))
        );
      });
    }
  }, [open]);

  const onAddOpen = (data?: any) => {
    if (data) {
      setEdit(true);
      form.setFieldsValue({
        ...data,
        username: data.preferredUsername,
        userId: data.id,
        roleList:
          data?.roleList?.length > 0
            ? {
                label: data?.roleList?.[0]?.roleName,
                value: data?.roleList?.[0]?.roleId,
              }
            : undefined,
      });
    } else {
      setEdit(false);
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
  };
  const onSave = async () => {
    const info = await form.validateFields();
    setLoading(true);
    const api = isEdit ? updateUser : createUser;
    api({
      ...info,
      roleList: info?.roleList ? [{ roleId: info?.roleList?.value, roleName: info?.roleList?.label }] : [],
      enabled: true,
    })
      .then(() => {
        message.success(formatMessage('common.optsuccess'));
        onClose();
        onSaveBack?.();
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const Dom = (
    <ProModal
      size="xs"
      open={open}
      maskClosable={false}
      onCancel={onClose}
      className={styles['use-add-modal']}
      title={formatMessage(isEdit ? 'account.editUsers' : 'account.newUsers')}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="userId" hidden>
          <Input />
        </Form.Item>
        <Row gutter={32}>
          <Col span={12}>
            <Form.Item
              label={formatMessage('account.account')}
              name="username"
              rules={[
                {
                  required: true,
                  message: formatMessage('rule.required'),
                },
                {
                  type: 'string',
                  min: 1,
                  max: 200,
                  message: formatMessage('rule.characterLimit'),
                },
                {
                  pattern: validNameRegex,
                  message: formatMessage('rule.illegality'),
                },
              ]}
            >
              <Input className="username" disabled={isEdit} placeholder={formatMessage('account.account')} />
            </Form.Item>
          </Col>
          {!isEdit && (
            <Col span={12}>
              <Form.Item
                label={formatMessage('appGui.password')}
                name="password"
                rules={[
                  {
                    required: true,
                    message: formatMessage('rule.required'),
                  },
                  {
                    max: 10,
                    message: formatMessage('uns.labelMaxLength', {
                      label: formatMessage('appGui.password'),
                      length: 10,
                    }),
                  },
                  { pattern: passwordRegex, message: formatMessage('rule.password') },
                ]}
              >
                <Input.Password placeholder={formatMessage('appGui.password')} autoComplete="new-password" />
              </Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item
              label={formatMessage('common.name')}
              name="firstName"
              rules={[
                {
                  type: 'string',
                  min: 1,
                  max: 200,
                  message: formatMessage('rule.characterLimit'),
                },
                {
                  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\-.@&+]*$/,
                  message: formatMessage('rule.invalidChars'),
                },
              ]}
            >
              <Input placeholder={formatMessage('common.name')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={formatMessage('account.phone')}
              name="phone"
              rules={[{ pattern: phoneRegex, message: formatMessage('rule.phone') }]}
              validateTrigger={['onBlur']}
            >
              <Input
                placeholder={formatMessage('account.phone')}
                onFocus={() => {
                  form.setFields([
                    {
                      name: 'phone',
                      errors: undefined, // 清除校验错误
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={formatMessage('account.email')} name="email" rules={[{ type: 'email' }]}>
              <Input placeholder={formatMessage('account.email')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={formatMessage('account.role')}
              name="roleList"
              rules={[
                {
                  required: true,
                  message: formatMessage('rule.required'),
                },
              ]}
            >
              <ComSelect
                placeholder={formatMessage('account.role')}
                options={options}
                // mode="multiple"
                allowClear
                onClick={(e) => {
                  e.preventDefault();
                }}
                labelInValue
              />
            </Form.Item>
          </Col>
        </Row>

        <Button onClick={onSave} style={{ height: 32 }} block type="primary" loading={loading}>
          {formatMessage('common.save')}
        </Button>
      </Form>
    </ProModal>
  );
  return {
    ModalAddDom: Dom,
    onAddOpen,
  };
};

export default useAddUser;
