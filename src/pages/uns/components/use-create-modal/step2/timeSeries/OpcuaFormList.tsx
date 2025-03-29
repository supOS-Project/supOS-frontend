import { FC, useMemo, useRef, useState } from 'react';
import { Form, Space, Input, InputNumber, Select, Divider, Button, App } from 'antd';
import { useTranslate } from '@/hooks';
import { SearchLocate } from '@carbon/icons-react';
import AttributeSelector from '../../modals/attribute-selector';
import { isEmpty, some, values } from 'lodash';

const OpcuaFormList: FC<any> = ({ commonRules, serverDetail, types }) => {
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();
  const attrListRef = useRef<any>(null);
  const { message } = App.useApp();
  const [editItem, setEditItem] = useState<any>(null);

  // 查询位号时需要的参数
  const protocolConfig = useMemo(
    () => ({
      protocolName: serverDetail?.protocolName,
      serverConfig: { server: serverDetail?.server },
    }),
    [serverDetail]
  );

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
                <div className="modbusfieldsWrap" style={{ width: '400px' }}>
                  <span title={form.getFieldValue('fields')[index].name}>
                    {form.getFieldValue('fields')[index].name}
                  </span>
                  <span title={form.getFieldValue('fields')[index].type}>
                    {form.getFieldValue('fields')[index].type}
                  </span>
                </div>

                {!form.getFieldValue('fields')[index].system && (
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                    <Button
                      title={formatMessage('common.search')}
                      color="default"
                      variant="filled"
                      style={{ border: '1px solid #CBD5E1', color: 'var(--supos-text-color)' }}
                      icon={<SearchLocate />}
                      onClick={() => {
                        if (some(values(protocolConfig.serverConfig), isEmpty)) {
                          message.warning(formatMessage('uns.pleaseInputServer'));
                        } else {
                          attrListRef?.current?.setOpen(true);
                          setEditItem({ keyPath: ['fields', name, 'index'], index });
                        }
                      }}
                    />
                  </div>
                )}
              </Space>
            ))}
          </>
        )}
      </Form.List>
      <AttributeSelector
        types={types}
        attrListRef={attrListRef}
        modalHeading="OPC UA"
        protocolConfig={protocolConfig}
        onSubmit={(record) => {
          if (record.dataType === form.getFieldValue('fields')[editItem.index].type) {
            form.setFieldValue(editItem.keyPath, record.name);
          } else {
            message.warning(formatMessage('uns.dataTypeNotMatch'));
          }
        }}
      />
    </>
  );
};
export default OpcuaFormList;
