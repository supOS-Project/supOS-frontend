import { FC } from 'react';
import { Form, Space, Input, Button, InputNumber, Divider, Select, Switch, Flex } from 'antd';
import { SubtractAlt, AddAlt } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';

const { TextArea } = Input;

const RestApiFormList: FC<any> = ({ commonRules }) => {
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();
  const method = Form.useWatch(['protocol', 'method']);

  const validatorJson = (_: any, value: any) => {
    try {
      JSON.parse(value || '{}');
      return Promise.resolve();
      // eslint-disable-next-line
    } catch (err) {
      return Promise.reject(new Error(formatMessage('uns.errorInTheSyntaxOfTheJSONData')));
    }
  };

  const getMethodForm = (method: any) => {
    switch (method) {
      case 'get':
        return (
          <>
            <Divider style={{ borderColor: '#c6c6c6', margin: 0, marginBottom: '24px' }} dashed />
            <Form.List name={['protocol', 'params']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Space
                      key={key}
                      style={{
                        display: 'flex',
                      }}
                      align="start"
                    >
                      <div
                        style={{ width: '140px', height: '32px', lineHeight: '32px' }}
                      >{`${formatMessage('uns.parameter')} ${index + 1}`}</div>
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage('uns.pleaseInputKeyName'),
                          },
                        ]}
                      >
                        <Input style={{ width: '195px' }} placeholder={formatMessage('uns.key')} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[
                          {
                            required: true,
                            message: formatMessage('uns.pleaseInputValue'),
                          },
                        ]}
                      >
                        <Input placeholder={formatMessage('uns.value')} style={{ width: '195px' }} />
                      </Form.Item>

                      <Button
                        color="default"
                        variant="filled"
                        icon={<SubtractAlt />}
                        onClick={() => {
                          remove(name);
                        }}
                        style={{ border: '1px solid #CBD5E1' }}
                      />
                    </Space>
                  ))}
                  <Button color="default" variant="filled" onClick={() => add()} block icon={<AddAlt size={20} />} />
                </>
              )}
            </Form.List>
          </>
        );

      case 'post':
        return (
          <Form.Item
            name={['protocol', 'body']}
            label={formatMessage('uns.body')}
            rules={[{ required: false, validator: validatorJson }]}
          >
            <TextArea rows={8} placeholder="" />
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Form.Item
        name={['protocol', 'path']}
        label={formatMessage('uns.path')}
        {...commonRules(formatMessage('uns.pleaseInputPath'))}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={['protocol', 'method']}
        label={formatMessage('uns.method')}
        {...commonRules(formatMessage('uns.pleaseSelectMethod'))}
      >
        <Select
          options={[
            { value: 'get', label: 'GET' },
            { value: 'post', label: 'POST' },
          ]}
          onChange={() => {
            form.setFieldValue(['protocol', 'params'], undefined);
            form.setFieldValue(['protocol', 'body'], undefined);
          }}
        />
      </Form.Item>
      <Form.Item name={['protocol', 'https']} label="HTTPS" {...commonRules}>
        <Switch />
      </Form.Item>
      <div className="keyTitle">{formatMessage('uns.headers')}</div>
      <Form.List name={['protocol', 'headers']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Flex key={key} gap={8}>
                <Form.Item
                  {...restField}
                  name={[name, 'key']}
                  rules={[
                    {
                      required: true,
                      message: formatMessage('uns.pleaseInputKeyName'),
                    },
                  ]}
                  style={{ flex: 1 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Input placeholder={formatMessage('uns.key')} />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'value']}
                  rules={[
                    {
                      required: true,
                      message: formatMessage('uns.pleaseInputValue'),
                    },
                  ]}
                  style={{ flex: 1 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Input placeholder={formatMessage('uns.value')} />
                </Form.Item>

                <Button
                  color="default"
                  variant="filled"
                  icon={<SubtractAlt />}
                  onClick={() => {
                    remove(name);
                  }}
                  style={{ border: '1px solid #CBD5E1', flexShrink: 0 }}
                />
              </Flex>
            ))}
            <Button color="default" variant="filled" onClick={() => add()} block icon={<AddAlt size={20} />} />
          </>
        )}
      </Form.List>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <Form.Item label={formatMessage('common.pageNumber')} style={{ marginBottom: 0 }}>
        <Space>
          <Form.Item name={['protocol', 'pageDef', 'start', 'key']}>
            <Input style={{ width: '315px' }} placeholder={formatMessage('uns.key')} />
          </Form.Item>
          <Form.Item name={['protocol', 'pageDef', 'start', 'value']}>
            <InputNumber min={0} style={{ width: '120px' }} step="1" placeholder={formatMessage('uns.value')} />
          </Form.Item>
        </Space>
      </Form.Item>
      <Form.Item label={formatMessage('common.number')} style={{ marginBottom: 0 }}>
        <Space>
          <Form.Item name={['protocol', 'pageDef', 'offset', 'key']}>
            <Input style={{ width: '315px' }} placeholder={formatMessage('uns.key')} />
          </Form.Item>
          <Form.Item name={['protocol', 'pageDef', 'offset', 'value']}>
            <InputNumber min={0} style={{ width: '120px' }} step="1" placeholder={formatMessage('uns.value')} />
          </Form.Item>
        </Space>
      </Form.Item>
      {getMethodForm(method)}
      <Divider style={{ borderColor: '#c6c6c6' }} dashed />
      <Form.Item label={formatMessage('uns.syncRate')} style={{ marginBottom: 0 }} required>
        <Space.Compact block>
          <Form.Item
            name={['protocol', 'syncRate', 'value']}
            {...commonRules(formatMessage('uns.pleaseInputValue'))}
            noStyle
          >
            <InputNumber style={{ width: '50%' }} min={1} step="1" />
          </Form.Item>
          <Form.Item
            name={['protocol', 'syncRate', 'unit']}
            {...commonRules(formatMessage('uns.pleaseSelectUnit'))}
            noStyle
          >
            <Select
              style={{ width: '50%' }}
              options={[
                // { value: 'ms', label: 'millisecond(s)' },
                { value: 's', label: formatMessage('uns.second') },
                { value: 'm', label: formatMessage('uns.minute') },
                { value: 'h', label: formatMessage('uns.hour') },
              ]}
            />
          </Form.Item>
        </Space.Compact>
      </Form.Item>
    </>
  );
};
export default RestApiFormList;
