import { useTranslate } from '@/hooks';
import { Form, InputNumber } from 'antd';

const IcmpFormList = () => {
  const formatMessage = useTranslate();
  return (
    <>
      <Form.Item
        name={['protocol', 'interval']}
        label={formatMessage('uns.pingInterval')}
        initialValue={30}
        rules={[{ required: true }]}
      >
        <InputNumber
          placeholder={formatMessage('uns.pleaseInputValue')}
          style={{ width: '100%' }}
          addonAfter={formatMessage('uns.second')}
        />
      </Form.Item>
      <Form.Item
        name={['protocol', 'timeout']}
        label={formatMessage('uns.timeout')}
        initialValue={10}
        rules={[{ required: true }]}
      >
        <InputNumber
          placeholder={formatMessage('uns.pleaseInputValue')}
          style={{ width: '100%' }}
          addonAfter={formatMessage('uns.second')}
        />
      </Form.Item>
      <Form.Item
        name={['protocol', 'retry']}
        label={formatMessage('uns.retryCount')}
        initialValue={3}
        rules={[{ required: true }]}
      >
        <InputNumber
          placeholder={formatMessage('uns.pleaseInputValue')}
          decimalSeparator="0"
          style={{ width: '100%' }}
        />
      </Form.Item>
    </>
  );
};

export default IcmpFormList;
