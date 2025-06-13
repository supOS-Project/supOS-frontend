import { FC, useEffect, useState, Dispatch, SetStateAction, useRef } from 'react';
import { Form, Select, Divider } from 'antd';
import { useTranslate } from '@/hooks';
import JsonForm from './source-form/json';
import { getTypes } from '@/apis/inter-api/uns';

import type { UnsTreeNode, InitTreeDataFnType } from '@/pages/uns/types';
import ComRadio from '@/components/com-radio';
import ProModal from '@/components/pro-modal';

export interface ReverseModalProps {
  currentNode?: UnsTreeNode;
  reverserOpen: boolean;
  setReverserOpen: Dispatch<SetStateAction<boolean>>;
  initTreeData: InitTreeDataFnType;
}

const ReverseModal: FC<ReverseModalProps> = ({ reverserOpen, setReverserOpen, currentNode, initTreeData }) => {
  const [form] = Form.useForm();
  const formatMessage = useTranslate();

  const [types, setTypes] = useState<string[]>([]);
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const source = Form.useWatch('source', form) || form.getFieldValue('source');

  const jsonFormRef = useRef<any>(null);

  const getSourceForm = () => {
    switch (source) {
      case 'json':
        return (
          <JsonForm
            ref={jsonFormRef}
            formatMessage={formatMessage}
            types={types}
            currentNode={currentNode}
            close={close}
            fullScreen={fullScreen}
            initTreeData={initTreeData}
          />
        );
      default:
        return null;
    }
  };

  const close = (refreshTree?: boolean) => {
    if (refreshTree) initTreeData({ reset: true });
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
      width={1000}
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
            onClick={(e) => {
              jsonFormRef?.current?.batchModifyDataType?.(e.target.value * 1);
            }}
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
