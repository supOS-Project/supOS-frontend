import { FC } from 'react';
import { Form, Space, Select, InputNumber, Divider } from 'antd';
import { ComCheckbox } from '@/components';
import SearchSelect from '@/pages/uns/components/use-create-modal/components/SearchSelect';
import { useTranslate } from '@/hooks';

const AggregationForm: FC<any> = () => {
  const formatMessage = useTranslate();
  const form = Form.useFormInstance();

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

  const selectAll = (options: string[] = []) => {
    const currentReferTopics = form.getFieldValue('referTopics') || [];
    const _referTopics = [...new Set([...currentReferTopics, ...options])].slice(0, 100);
    form.setFieldsValue({ referTopics: _referTopics });
  };

  return (
    <>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <Form.Item label={formatMessage('uns.frequency')} style={{ marginBottom: 0 }} required>
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
      </Form.Item>
      <Divider style={{ borderColor: '#c6c6c6' }} />
      <Form.Item name="save2db" label={formatMessage('uns.persistence')} valuePropName="checked">
        <ComCheckbox />
      </Form.Item>

      <Form.Item label={formatMessage('uns.aggregationTarget')} name="referTopics" rules={[{ required: true }]}>
        <SearchSelect
          placeholder={formatMessage('uns.searchInstance')}
          type={2}
          mode="multiple"
          maxCount={100}
          selectAll={selectAll}
          normal
        />
      </Form.Item>
    </>
  );
};
export default AggregationForm;
