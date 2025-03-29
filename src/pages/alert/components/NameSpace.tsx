import { Form, Space } from 'antd';
import { ComSelect } from '@/components';
import { useTranslate } from '@/hooks';
import DebounceSelect from '@/pages/uns/components/use-create-modal/components/SearchSelect.tsx';
import { useEffect, useState } from 'react';
import { searchTreeData } from '@/apis/inter-api/uns.ts';

const NameSpace = ({ isEdit }: any) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState<any[]>();
  const formatMessage = useTranslate();
  const onChange = (e: any, options: any, index: number) => {
    const _options = options.find((option: any) => option.topic === e);
    setOptions(_options?.fields || []);
    form.setFieldValue(['refers', index, 'field'], undefined);
  };

  useEffect(() => {
    if (isEdit) {
      const params: any = { type: 4, p: 1, sz: 1, k: form.getFieldValue(['refers', 0, 'topic']) };
      searchTreeData(params).then((res: any) => {
        setOptions(res?.[0]?.fields || []);
      });
    }
  }, [isEdit]);

  return (
    <Form.Item label={formatMessage('alert.key')} required>
      <Space
        style={{ width: '100%' }}
        styles={{
          item: { width: '50%', overflow: 'hidden' },
        }}
      >
        <Form.Item
          name={['refers', 0, 'topic']}
          style={{ marginBottom: 0 }}
          rules={[
            {
              required: true,
              message: formatMessage('uns.pleaseInputNamespace'),
            },
          ]}
        >
          <DebounceSelect
            style={{ width: '100%' }}
            type={4}
            placeholder={formatMessage('uns.namespace')}
            onChange={onChange}
            index={0}
            popupMatchSelectWidth={400}
          />
        </Form.Item>
        <Form.Item
          name={['refers', 0, 'field']}
          style={{ marginBottom: 0 }}
          rules={[
            {
              required: true,
              message: formatMessage('uns.pleaseSelectKeyType'),
            },
          ]}
        >
          <ComSelect
            fieldNames={{ label: 'name', value: 'name' }}
            placeholder={formatMessage('uns.key')}
            options={options}
            style={{ width: '100%' }}
            allowClear
          />
        </Form.Item>
      </Space>
    </Form.Item>
  );
};

export default NameSpace;
