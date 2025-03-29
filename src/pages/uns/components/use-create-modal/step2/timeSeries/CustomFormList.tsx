import { FC } from 'react';
import { Form, Space, Input, InputNumber, Divider } from 'antd';
import { useTranslate } from '@/hooks';

const CustomFormList: FC<any> = () => {
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();
  const outputDataType = Form.useWatch(['protocol', 'outputDataType']);

  return (
    <>
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
                <Form.Item
                  {...restField}
                  name={[name, 'index']}
                  rules={[
                    {
                      required: true,
                      message: formatMessage(
                        outputDataType === 'ARRAY' ? 'uns.pleaseInputNum' : 'uns.pleaseInputString'
                      ),
                    },
                  ]}
                  wrapperCol={{ span: 24 }}
                >
                  {outputDataType === 'ARRAY' ? (
                    <InputNumber min={0} style={{ width: '150px' }} step="1" />
                  ) : (
                    <Input style={{ width: '150px' }} />
                  )}
                </Form.Item>
              </Space>
            ))}
          </>
        )}
      </Form.List>
    </>
  );
};
export default CustomFormList;
