import { Form, InputNumber, Space } from 'antd';
import { ComSelect } from '@/components';
import { useTranslate } from '@/hooks';

const Condition = () => {
  const formatMessage = useTranslate();
  const options = [
    {
      label: formatMessage('alert.greaterThan'),
      value: '>',
    },
    {
      label: formatMessage('alert.greaterEqualThan'),
      value: '>=',
    },
    {
      label: formatMessage('alert.lessThan'),
      value: '<',
    },
    {
      label: formatMessage('alert.lessEqualThan'),
      value: '<=',
    },
    {
      label: formatMessage('alert.equal'),
      value: '=',
    },
    {
      label: formatMessage('alert.noEqual'),
      value: '!=',
    },
    // {
    //   label: formatMessage('alert.range'),
    //   value: 'range',
    // },
  ];

  return (
    <Form.Item label={formatMessage('alert.condition')} required>
      <Space
        style={{ width: '100%' }}
        styles={{
          item: { width: '50%', overflow: 'hidden' },
        }}
      >
        <Form.Item
          name={['protocol', 'condition']}
          style={{ marginBottom: 0 }}
          rules={[{ required: true, message: formatMessage('rule.required') }]}
        >
          <ComSelect
            allowClear
            options={options}
            style={{ width: '100%' }}
            placeholder={formatMessage('alert.condition')}
          />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(pre, cur) => pre?.protocol?.condition !== cur?.protocol?.condition}>
          {({ getFieldValue }) => {
            const conditionType = getFieldValue(['protocol', 'condition']);
            return conditionType === 'range' ? (
              <Space
                style={{ width: '100%' }}
                styles={{
                  item: { width: '50%' },
                }}
              >
                <Form.Item name="num1" style={{ marginBottom: 0 }}>
                  <InputNumber style={{ width: '100%' }} placeholder={formatMessage('alert.min')} />
                </Form.Item>
                <Form.Item name="num2" style={{ marginBottom: 0 }}>
                  <InputNumber style={{ width: '100%' }} placeholder={formatMessage('alert.max')} />
                </Form.Item>
              </Space>
            ) : (
              <Form.Item
                name={['protocol', 'limitValue']}
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: formatMessage('rule.required') }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder={formatMessage('alert.regularValue')} />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Space>
    </Form.Item>
  );
};

export default Condition;
