import { FC } from 'react';
import { Form, Space, Input, InputNumber, Select, Divider } from 'antd';
import { useTranslate } from '@/hooks';

const OpcdaFormList: FC<any> = ({ commonRules }) => {
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();

  return (
    <>
      <Form.Item label={formatMessage('uns.pollRate')} style={{ marginBottom: 0 }} required>
        <Space.Compact block>
          <Form.Item
            name={['protocol', 'pollRate', 'value']}
            {...commonRules(formatMessage('uns.pleaseInputValue'))}
            noStyle
          >
            <InputNumber style={{ width: '50%' }} min={1} step="1" />
          </Form.Item>
          <Form.Item
            name={['protocol', 'pollRate', 'unit']}
            style={{ width: '50%' }}
            {...commonRules(formatMessage('uns.pleaseSelectUnit'))}
            noStyle
          >
            <Select
              style={{ width: '50%' }}
              options={[
                { value: 'ms', label: formatMessage('uns.millisecond') },
                { value: 's', label: formatMessage('uns.second') },
                { value: 'm', label: formatMessage('uns.minute') },
                { value: 'h', label: formatMessage('uns.hour') },
              ]}
            />
          </Form.Item>
        </Space.Compact>
      </Form.Item>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <div className="keyTitle">{formatMessage('uns.key')}</div>
      <Form.List name="fields">
        {(fields) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Space
                key={key}
                style={{
                  display: 'flex',
                }}
                align="start"
              >
                <div className="modbusfieldsWrap" style={{ width: '430px' }}>
                  <span title={form.getFieldValue('fields')[index].name}>
                    {form.getFieldValue('fields')[index].name}
                  </span>
                  <span title={form.getFieldValue('fields')[index].type}>
                    {form.getFieldValue('fields')[index].type}
                  </span>
                </div>

                {!form.getFieldValue('fields')[index].system && (
                  <Form.Item
                    {...restField}
                    name={[name, 'index']}
                    rules={[
                      {
                        required: true,
                        message: formatMessage('uns.pleaseInputString'),
                      },
                    ]}
                    wrapperCol={{ span: 24 }}
                  >
                    <Input style={{ width: '150px' }} placeholder="String" />
                  </Form.Item>
                )}
              </Space>
            ))}
          </>
        )}
      </Form.List>
    </>
  );
};
export default OpcdaFormList;
