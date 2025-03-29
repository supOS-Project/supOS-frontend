import { FC, useState, useEffect } from 'react';
import { Form, Input, InputNumber, Space, Button, Switch, Divider, Select } from 'antd';
import { SubtractAlt, AddAlt } from '@carbon/icons-react';
import { getProtocolDetail } from '@/apis/inter-api/protocol';

const CustomServerForm: FC<any> = ({ protocolName, isAdd, serverDetail }) => {
  const [customServerForm, setCustomServerForm] = useState<any>([]);
  // const form = Form.useFormInstance();

  const getFormItem = ({ name, type, value, required }: any) => {
    switch (type) {
      case 'input':
        return (
          <Form.Item
            name={['server', name]}
            label={name}
            initialValue={value}
            key={name}
            rules={[{ required: required, message: '' }]}
          >
            {isAdd ? <Input /> : <div>{serverDetail?.server?.[name]}</div>}
          </Form.Item>
        );
      case 'inputNumber':
        return (
          <Form.Item
            name={['server', name]}
            label={name}
            initialValue={value}
            key={name}
            rules={[{ required: required, message: '' }]}
          >
            {isAdd ? <InputNumber style={{ width: '100%' }} /> : <div>{serverDetail?.server?.[name]}</div>}
          </Form.Item>
        );
      case 'switch':
        return (
          <Form.Item name={['server', name]} label={name} initialValue={value} key={name}>
            {isAdd ? <Switch /> : <div>{serverDetail?.server?.[name]}</div>}
          </Form.Item>
        );
      case 'formList':
        return (
          <Form.Item key={name} noStyle>
            <div style={{ lineHeight: '32px', fontWeight: 'bold' }}>{name}</div>
            <Form.List name={['server', name]} initialValue={isAdd ? value : serverDetail?.server?.[name]}>
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
                      <Form.Item
                        {...restField}
                        name={[name, `${Object.keys(value[0])[0]}`]}
                        wrapperCol={{ span: 24 }}
                        style={{ width: '270px' }}
                        rules={[{ required: required, message: '' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, `${Object.keys(value[0])[1]}`]}
                        wrapperCol={{ span: 24 }}
                        style={{ width: '270px' }}
                        rules={[{ required: required, message: '' }]}
                      >
                        <Input />
                      </Form.Item>
                      {index > 0 && (
                        <Button
                          color="default"
                          variant="filled"
                          icon={<SubtractAlt />}
                          onClick={() => {
                            remove(name);
                          }}
                          style={{
                            border: '1px solid #CBD5E1',
                            color: 'var(--supos-text-color)',
                            backgroundColor: 'var(--supos-uns-button-color)',
                          }}
                        />
                      )}
                    </Space>
                  ))}

                  {isAdd && (
                    <Button
                      color="default"
                      variant="filled"
                      onClick={() => add()}
                      block
                      style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
                      icon={<AddAlt size={20} />}
                    />
                  )}
                </>
              )}
            </Form.List>
            <Divider style={{ borderColor: '#c6c6c6' }} />
          </Form.Item>
        );
      case 'multipleSelect':
        return (
          <Form.Item
            name={['server', name]}
            label={name}
            initialValue={value}
            key={name}
            rules={[{ required: required, message: '' }]}
          >
            {isAdd ? <Select mode="tags" options={[]} /> : <div>{serverDetail?.server?.[name]}</div>}
          </Form.Item>
        );
      default:
        break;
    }
  };

  useEffect(() => {
    getProtocolDetail(protocolName).then((res: any) => {
      setCustomServerForm(res?.serverConfig || []);
    });
  }, [protocolName]);

  return (
    <>
      {customServerForm.map((e: any) => {
        return getFormItem(e);
      })}
    </>
  );
};
export default CustomServerForm;
