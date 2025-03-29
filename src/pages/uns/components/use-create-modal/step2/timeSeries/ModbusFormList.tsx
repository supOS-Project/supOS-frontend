import { FC, useMemo, useRef, useState } from 'react';
import { Form, Space, InputNumber, Input, Select, Divider, Button, App } from 'antd';
import { useTranslate } from '@/hooks';
import { ComPopupGuide } from '@/components';
import { SearchLocate } from '@carbon/icons-react';
import AttributeSelector from '../../modals/attribute-selector';
import { isEmpty, omit, some, toNumber, values } from 'lodash';

const ModbusFormList: FC<any> = ({ addNamespaceForAi, setAddNamespaceForAi, commonRules, serverDetail, types }) => {
  const form = Form.useFormInstance();
  const formatMessage = useTranslate();
  const attrListRef = useRef<any>(null);
  const { message } = App.useApp();
  const [editItem, setEditItem] = useState<any>(null);

  const protocol = Form.useWatch('protocol', form) || form.getFieldValue('protocol');
  // 查询位号时需要的参数
  const protocolConfig = useMemo(
    () => ({
      protocolName: protocol?.protocol,
      serverConfig: { ...omit(protocol || {}, ['pollRate']), server: serverDetail?.server },
    }),
    [protocol, serverDetail]
  );

  return (
    <>
      <Form.Item
        name={['protocol', 'unitId']}
        label={
          <ComPopupGuide
            currentStep={addNamespaceForAi?.currentStep}
            steps={addNamespaceForAi?.steps}
            stepName="unitId"
            placement="left"
            onBegin={(_, __, info) => {
              console.log(info?.value);
              form.setFieldsValue(info?.value);
            }}
            onFinish={(_, nextStepName) => {
              setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
            }}
          >
            {formatMessage('uns.unitID')}
          </ComPopupGuide>
        }
        {...commonRules(formatMessage('uns.pleaseInputUnitId'))}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={['protocol', 'fc']}
        label={
          <ComPopupGuide
            currentStep={addNamespaceForAi?.currentStep}
            steps={addNamespaceForAi?.steps}
            stepName="fc"
            placement="left"
            onBegin={(_, __, info) => {
              form.setFieldsValue(info?.value);
            }}
            onFinish={(_, nextStepName) => {
              setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
            }}
          >
            FC
          </ComPopupGuide>
        }
        {...commonRules(formatMessage('uns.pleaseSelectFC'))}
      >
        <Select
          options={[
            { value: 'Coil', label: formatMessage('uns.fc1') },
            { value: 'Input', label: formatMessage('uns.fc2') },
            { value: 'HoldingRegister', label: formatMessage('uns.fc3') },
            { value: 'InputRegister', label: formatMessage('uns.fc4') },
          ]}
        />
      </Form.Item>
      <Form.Item
        name={['protocol', 'address']}
        label={
          <ComPopupGuide
            currentStep={addNamespaceForAi?.currentStep}
            steps={addNamespaceForAi?.steps}
            stepName="address"
            placement="left"
            onBegin={(_, __, info) => {
              form.setFieldsValue(info?.value);
            }}
            onFinish={(_, nextStepName) => {
              setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
            }}
          >
            {formatMessage('uns.address')}
          </ComPopupGuide>
        }
        {...commonRules(formatMessage('uns.pleaseInputAddress'))}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name={['protocol', 'quantity']}
        label={
          <ComPopupGuide
            currentStep={addNamespaceForAi?.currentStep}
            steps={addNamespaceForAi?.steps}
            stepName="quantity"
            placement="left"
            onBegin={(_, __, info) => {
              form.setFieldsValue(info?.value);
            }}
            onFinish={(_, nextStepName) => {
              setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
            }}
          >
            {formatMessage('uns.quantity')}
          </ComPopupGuide>
        }
        {...commonRules(formatMessage('uns.pleaseInputQuantity'))}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={
          <ComPopupGuide
            currentStep={addNamespaceForAi?.currentStep}
            steps={addNamespaceForAi?.steps}
            stepName="pollRate"
            placement="left"
            onBegin={(_, __, info) => {
              form.setFieldsValue(info?.value);
            }}
            onFinish={(_, nextStepName) => {
              setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
            }}
          >
            {formatMessage('uns.pollRate')}
          </ComPopupGuide>
        }
        style={{ marginBottom: 0 }}
        required
      >
        <Space.Compact block>
          <Form.Item
            name={['protocol', 'pollRate', 'value']}
            {...commonRules(formatMessage('uns.pleaseInputValue'))}
            // wrapperCol={{ span: 24 }}
            noStyle
          >
            <InputNumber style={{ width: '50%' }} min={1} step="1" />
          </Form.Item>
          <Form.Item
            name={['protocol', 'pollRate', 'unit']}
            // style={{ width: '50%' }}
            {...commonRules(formatMessage('uns.pleaseSelectUnit'))}
            // wrapperCol={{ span: 24 }}
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
                          message: formatMessage('uns.pleaseInputNum'),
                        },
                      ]}
                    >
                      <InputNumber min={0} style={{ width: '150px' }} step="1" placeholder="Num" />
                    </Form.Item>
                    <Button
                      title={formatMessage('common.search')}
                      color="default"
                      variant="filled"
                      style={{ border: '1px solid #CBD5E1', color: 'var(--supos-text-color)' }}
                      icon={<SearchLocate />}
                      onClick={() => {
                        if (some(values(protocolConfig.serverConfig), isEmpty)) {
                          message.warning(formatMessage('uns.pleaseInputConfig'));
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
        modalHeading="Modbus"
        protocolConfig={protocolConfig}
        onSubmit={(record) => {
          if (record.dataType === form.getFieldValue('fields')[editItem.index].type) {
            form.setFieldValue(editItem.keyPath, record.name ? toNumber(record.name) : record.name);
          } else {
            message.warning(formatMessage('uns.dataTypeNotMatch'));
          }
        }}
      />
    </>
  );
};
export default ModbusFormList;
