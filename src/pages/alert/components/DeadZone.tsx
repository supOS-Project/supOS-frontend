import { Form, InputNumber, Space } from 'antd';
import { ComSelect } from '@/components';
import { useTranslate } from '@/hooks';

const DeadZone = () => {
  const formatMessage = useTranslate();

  const options = [
    {
      label: formatMessage('alert.value'),
      value: 1,
    },
    {
      label: formatMessage('alert.percent'),
      value: 2,
    },
  ];

  return (
    <Form.Item label={formatMessage('alert.deadZone')}>
      <Space
        style={{ width: '100%' }}
        styles={{
          item: { width: '50%', overflow: 'hidden' },
        }}
      >
        <Form.Item name={['protocol', 'deadBandType']} style={{ marginBottom: 0 }}>
          <ComSelect options={options} style={{ width: '100%' }} placeholder={formatMessage('alert.deadZone')} />
        </Form.Item>
        <Form.Item name={['protocol', 'deadBand']} style={{ marginBottom: 0 }}>
          <InputNumber style={{ width: '100%' }} placeholder={formatMessage('alert.regularValue')} />
        </Form.Item>
      </Space>
    </Form.Item>
  );
};

export default DeadZone;
