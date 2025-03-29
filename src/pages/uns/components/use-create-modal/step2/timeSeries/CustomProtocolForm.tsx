import { FC, useState, useEffect } from 'react';
import { Form, Input, InputNumber, Space, Button, Switch, Select, Flex } from 'antd';
import { SubtractAlt, AddAlt, Add, TrashCan, Information } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import { getProtocolDetail } from '@/apis/inter-api/protocol';
import CustomFormList from './CustomFormList';
import { FIXED_PROTOCOLS } from '@/pages/uns/components/use-create-modal/CONST';

const CustomProtocolForm: FC<any> = ({
  customProtocolData,
  serverList,
  deleteServerOption,
  setServerDetail,
  setModalType,
  serverConn,
  setServerConn,
  protocol,
}) => {
  const [customProtocolForm, setCustomProtocolForm] = useState<any>([]);
  const [outputDataType, setOutputDataType] = useState<any>([]);
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();

  const getFormItem = ({ name, type, value, required }: any) => {
    switch (type) {
      case 'input':
        return (
          <Form.Item
            name={['protocol', name]}
            label={name}
            initialValue={value}
            key={name}
            required={required}
            rules={[{ required: required, message: '' }]}
          >
            <Input />
          </Form.Item>
        );
      case 'select':
        return serverConn === name ? (
          <Form.Item label={name} key={name} required={required}>
            <Flex gap={8}>
              <Form.Item
                name={['protocol', name]}
                initialValue={customProtocolData.serverName}
                key={name}
                noStyle
                required={required}
                rules={[{ required: required, message: '' }]}
              >
                <Select
                  showSearch
                  allowClear
                  options={serverList}
                  optionRender={(option) => (
                    <Flex align="center" justify="space-between">
                      <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {option.data.serverName}
                      </span>
                      <TrashCan onClick={(e) => deleteServerOption(e, option.data)} />
                    </Flex>
                  )}
                  fieldNames={{
                    label: 'serverName',
                    value: 'serverName',
                  }}
                />
              </Form.Item>
              <Button
                color="default"
                variant="filled"
                icon={<Information />}
                disabled={!form.getFieldValue(['protocol', `${serverConn}`])}
                onClick={() => {
                  const customServerName = form.getFieldValue(['protocol', serverConn]);
                  const customServerDetail = serverList.find((e: any) => e.serverName === customServerName) || {};
                  setServerDetail(customServerDetail);
                  setModalType('viewServer');
                }}
                style={{ border: '1px solid #CBD5E1', flexShrink: 0 }}
              ></Button>
              <Button
                color="default"
                variant="filled"
                icon={<Add />}
                onClick={() => {
                  setModalType('addServer');
                }}
                style={{ border: '1px solid #CBD5E1', color: 'var(--supos-text-color)', flexShrink: 0 }}
              />
            </Flex>
          </Form.Item>
        ) : (
          <Form.Item
            name={['protocol', name]}
            initialValue={value}
            key={name}
            required={required}
            rules={[{ required: required, message: '' }]}
          >
            <Select showSearch allowClear options={[]} />
          </Form.Item>
        );
      case 'multipleSelect':
        return (
          <Form.Item
            name={['server', name]}
            label={name}
            initialValue={value}
            key={name}
            required={required}
            rules={[{ required: required, message: '' }]}
          >
            <Select mode="tags" options={[]} />
          </Form.Item>
        );
      case 'inputNumber':
        return (
          <Form.Item
            name={['protocol', name]}
            label={name}
            initialValue={value}
            key={name}
            required={required}
            rules={[{ required: required, message: '' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        );
      case 'switch':
        return (
          <Form.Item name={['protocol', name]} label={name} initialValue={value} key={name}>
            <Switch />
          </Form.Item>
        );
      case 'formList':
        return (
          <Form.Item key={name} noStyle>
            <div style={{ lineHeight: '32px', fontWeight: 'bold' }}>{name}</div>
            <Form.List name={['protocol', name]} initialValue={value}>
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
                        name={[name, 'name']}
                        wrapperCol={{ span: 24 }}
                        style={{ width: '270px' }}
                        required={required}
                        rules={[{ required: required, message: '' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        wrapperCol={{ span: 24 }}
                        style={{ width: '270px' }}
                        required={required}
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

                  <Button
                    color="default"
                    variant="filled"
                    onClick={() => add()}
                    block
                    style={{ color: 'var(--supos-text-color)', backgroundColor: 'var(--supos-uns-button-color)' }}
                    icon={<AddAlt size={20} />}
                  />
                </>
              )}
            </Form.List>
          </Form.Item>
        );
      default:
        break;
    }
  };

  const commonRules = (message: any) => {
    return {
      rules: [
        {
          required: true,
          message,
        },
      ],
    };
  };

  useEffect(() => {
    if (!FIXED_PROTOCOLS.includes(protocol)) {
      // form.setFieldValue(['protocol', serverConn], undefined);
      setCustomProtocolForm([]);
      getProtocolDetail(protocol).then((res: any) => {
        setCustomProtocolForm(res?.clientConfig || []);
        setServerConn(res?.serverConn || '');
        setOutputDataType(res?.outputDataType || []);
      });
    }
  }, [protocol]);

  return (
    <>
      {customProtocolForm.map((e: any) => {
        return getFormItem(e);
      })}
      <Form.Item
        name={['protocol', 'outputDataType']}
        label={formatMessage('uns.outputDataType')}
        {...commonRules(formatMessage('uns.pleaseSelectType'))}
      >
        <Select
          options={outputDataType}
          placeholder={formatMessage('uns.pleaseSelectType')}
          fieldNames={{ label: 'value', value: 'key' }}
          onChange={() => {
            const fields = form.getFieldValue('fields');
            fields.forEach((e: any) => {
              e.index = undefined;
            });
            form.setFieldValue('fields', fields);
          }}
        />
      </Form.Item>
      <CustomFormList />
    </>
  );
};
export default CustomProtocolForm;
