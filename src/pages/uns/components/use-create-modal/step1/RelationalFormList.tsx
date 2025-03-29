import { FC } from 'react';
import { Form, Flex, Input, Select, Button } from 'antd';
import { SubtractAlt, AddAlt } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import Icon from '@ant-design/icons';
import { MainKey } from '@/components';
import { ComPopupGuide } from '@/components';

const { Option } = Select;

const RelationalFormList: FC<any> = ({
  types,
  disabled,
  isCreateFolder,
  addNamespaceForAi,
  setAddNamespaceForAi,
  showMainKey = true,
}) => {
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();
  const dataType = Form.useWatch('dataType');
  const calculationType = Form.useWatch('calculationType');
  const fieldList = Form.useWatch('fields', form);
  const mainKey = Form.useWatch('mainKey', form);

  const setMainKey = (index: any) => {
    form.setFieldValue('mainKey', index);
  };

  return (
    <>
      <ComPopupGuide
        stepName={'fileFields'}
        steps={addNamespaceForAi?.steps}
        currentStep={addNamespaceForAi?.currentStep}
        placement="left"
        onBegin={(_, __, info) => {
          form.setFieldsValue(info?.value);
        }}
        onFinish={(_, nextStepName) => {
          setAddNamespaceForAi({ ...addNamespaceForAi, currentStep: nextStepName });
        }}
      >
        <div className="keyTitle">{formatMessage('uns.key')}</div>
      </ComPopupGuide>
      <Form.Item name="mainKey" hidden>
        <Input />
      </Form.Item>
      <Form.List name="fields">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Flex key={key} gap="8px">
                {dataType === 2 && showMainKey && (
                  <Button
                    className={mainKey === index ? 'activeKeyIndexBtn' : 'keyIndexBtn'}
                    color="default"
                    variant="filled"
                    icon={<Icon component={MainKey} />}
                    onClick={() => {
                      if (mainKey === index) {
                        setMainKey(undefined);
                      } else {
                        setMainKey(index);
                      }
                    }}
                    style={{
                      color: 'var(--supos-text-color)',
                      backgroundColor: 'var(--supos-uns-button-color)',
                    }}
                    disabled={!(fieldList[index]?.type && ['int', 'long', 'string'].includes(fieldList[index]?.type))}
                  />
                )}
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  rules={[
                    {
                      required: true,
                      message: formatMessage('uns.pleaseInputKeyName'),
                    },
                    {
                      pattern: disabled ? /./s : /^[A-Za-z][A-Za-z0-9_]*$/,
                      message: formatMessage('uns.keyNameFormat'),
                    },
                  ]}
                  wrapperCol={{ span: 24 }}
                  style={{ flex: 1 }}
                >
                  <Input disabled={disabled} placeholder={formatMessage('common.name')} />
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
                    disabled={disabled}
                    placeholder={formatMessage('uns.type')}
                    onChange={(type) => {
                      if (index === mainKey && !['int', 'long', 'string'].includes(type)) {
                        setMainKey(undefined);
                      }
                    }}
                  >
                    {(dataType === 3 ? types.slice(0, 4) : types).map((e: any) => {
                      return (
                        <Option key={e} value={e}>
                          {e}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item {...restField} name={[name, 'displayName']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                  <Input
                    disabled={disabled}
                    placeholder={`${formatMessage('uns.displayName')}(${formatMessage('uns.optional')})`}
                  />
                </Form.Item>
                <Form.Item {...restField} name={[name, 'remark']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
                  <Input
                    disabled={disabled}
                    placeholder={`${formatMessage('uns.remark')}(${formatMessage('uns.optional')})`}
                  />
                </Form.Item>
                {!disabled && (
                  <Button
                    color="default"
                    variant="filled"
                    icon={<SubtractAlt />}
                    onClick={() => {
                      remove(name);
                      form.setFieldValue('functions', undefined);
                      if (mainKey === index) {
                        setMainKey(undefined);
                      }
                    }}
                    style={{
                      border: '1px solid #CBD5E1',
                      color: 'var(--supos-text-color)',
                      backgroundColor: 'var(--supos-uns-button-color)',
                    }}
                    disabled={fields.length === 1 && !isCreateFolder}
                  />
                )}
              </Flex>
            ))}
            {!disabled && (dataType !== 3 || (dataType === 3 && calculationType === 4)) && (
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
            )}
          </>
        )}
      </Form.List>
    </>
  );
};
export default RelationalFormList;
