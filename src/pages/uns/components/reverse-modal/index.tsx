import { FC, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { ProModal } from '@/components';
import { Form, Select, Divider } from 'antd';
import { ComRadio } from '@/components';
import { useTranslate } from '@/hooks';
import JsonForm from './source-form/json';
import { getTypes } from '@/apis/inter-api/uns';

export interface ReverseModalProps {
  currentPath: string;
  reverserOpen: boolean;
  setReverserOpen: Dispatch<SetStateAction<boolean>>;
  initTreeData: (data: any, cb?: () => void) => void;
}

const ReverseModal: FC<ReverseModalProps> = ({ reverserOpen, setReverserOpen, currentPath, initTreeData }) => {
  const [form] = Form.useForm();
  const formatMessage = useTranslate();

  const [types, setTypes] = useState<string[]>([]);
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const source = Form.useWatch('source', form) || form.getFieldValue('source');

  const getSourceForm = () => {
    switch (source) {
      case 'json':
        return (
          <JsonForm
            formatMessage={formatMessage}
            types={types}
            currentPath={currentPath}
            close={close}
            fullScreen={fullScreen}
          />
        );
      default:
        return null;
    }
  };

  const close = (refreshTree?: boolean) => {
    if (refreshTree) initTreeData({});
    setReverserOpen(false);
  };

  useEffect(() => {
    getTypes()
      .then((res: any) => {
        setTypes(res || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <ProModal
      title={formatMessage('uns.batchReverseGeneration')}
      draggable={false}
      width={800}
      open={reverserOpen}
      onCancel={() => close()}
      maskClosable={false}
      centered={false}
      keyboard={false}
      onFullScreenCallBack={(e) => {
        setFullScreen(e);
      }}
    >
      <Form
        name="reverseForm"
        form={form}
        colon={false}
        style={{ color: 'var(--supos-text-color)', position: 'relative' }}
        initialValues={{
          dataType: 1,
          source: 'json',
        }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        labelAlign="left"
        labelWrap
      >
        <Form.Item name="dataType" label={formatMessage('uns.databaseType')}>
          <ComRadio
            options={[
              { label: formatMessage('uns.timeSeries'), value: 1 },
              { label: formatMessage('uns.relational'), value: 2 },
            ]}
          />
        </Form.Item>
        <Form.Item name="source" label={formatMessage('uns.source')} rules={[{ required: true }]}>
          <Select options={[{ label: 'JSON', value: 'json' }]} onChange={() => {}} />
        </Form.Item>
        <Divider style={{ borderColor: '#c6c6c6' }} />
        {getSourceForm()}
      </Form>
    </ProModal>
  );
};
export default ReverseModal;
