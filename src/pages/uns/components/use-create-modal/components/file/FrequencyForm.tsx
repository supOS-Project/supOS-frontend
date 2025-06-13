import { Form, Space, InputNumber, Select } from 'antd';
import { useTranslate } from '@/hooks';

const FrequencyForm = () => {
  const formatMessage = useTranslate();
  const commonRules = (message: string) => {
    return {
      rules: [
        {
          required: true,
          message,
        },
      ],
    };
  };
  return (
    <Space.Compact block>
      <Form.Item name={['frequency', 'value']} {...commonRules(formatMessage('uns.pleaseInputValue'))} noStyle>
        <InputNumber style={{ width: '50%' }} min={1} step="1" />
      </Form.Item>
      <Form.Item
        name={['frequency', 'unit']}
        style={{ width: '50%' }}
        {...commonRules(formatMessage('uns.pleaseSelectUnit'))}
        noStyle
      >
        <Select
          style={{ width: '50%' }}
          options={[
            { value: 's', label: formatMessage('uns.second') },
            { value: 'm', label: formatMessage('uns.minute') },
            { value: 'h', label: formatMessage('uns.hour') },
          ]}
        />
      </Form.Item>
    </Space.Compact>
  );
};

export default FrequencyForm;
