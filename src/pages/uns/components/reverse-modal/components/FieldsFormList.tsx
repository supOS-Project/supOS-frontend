import { FC } from 'react';
import { Form, Flex, Input, Select, Button } from 'antd';
import { SubtractAlt, AddAlt } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import Icon from '@ant-design/icons';
import { MainKey } from '@/components';
import './FieldsFormList.scss';

const { Option } = Select;

export interface FieldsFormListProps {
  types: string[];
  keepOne?: boolean;
}

const FieldsFormList: FC<FieldsFormListProps> = ({ types, keepOne }) => {
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();
  const dataType = Form.useWatch('dataType');
  const fieldList = Form.useWatch(['currentNode', 'fields'], form);
  const mainKey = Form.useWatch(['currentNode', 'mainKey'], form);

  const relational = dataType === 2;
  const setMainKey = (index: number | undefined) => {
    if (!relational) return;
    form.setFieldValue(['currentNode', 'mainKey'], index);
  };

  return (
    <>
      <div style={{ marginBottom: '10px' }}>{formatMessage('uns.key')}</div>
      {relational && (
        <Form.Item name={['currentNode', 'mainKey']} hidden>
          <Input />
        </Form.Item>
      )}
      <Form.List name={['currentNode', 'fields']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Flex key={key} gap="8px">
                {relational && keepOne && (
                  <Button
                    className={mainKey === index ? 'activeKeyIndexBtn' : 'keyIndexBtn'}
                    color="default"
                    variant="filled"
                    icon={<Icon component={MainKey} />}
                    onClick={() => {
                      setMainKey(mainKey === index ? undefined : index);
                    }}
                    style={{
                      color: 'var(--supos-text-color)',
                      backgroundColor: 'var(--supos-uns-button-color)',
                    }}
                    disabled={!['int', 'long', 'string'].includes(fieldList?.[index]?.type)}
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
                  style={{ flex: 1 }}
                >
                  <Select
                    placeholder={formatMessage('uns.type')}
                    onChange={(type) => {
                      if (index === mainKey && !['int', 'long', 'string'].includes(type)) {
                        setMainKey(undefined);
                      }
                    }}
                  >
                    {types.map((e: any) => (
                      <Option key={e} value={e}>
                        {e}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item {...restField} name={[name, 'displayName']} wrapperCol={{ span: 24 }} style={{ flex: 1 }}>
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
                    if (mainKey === index) setMainKey(undefined);
                  }}
                  disabled={keepOne && fields.length === 1}
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
              icon={<AddAlt size={20} />}
            />
          </>
        )}
      </Form.List>
    </>
  );
};
export default FieldsFormList;
