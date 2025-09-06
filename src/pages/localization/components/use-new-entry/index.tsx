import useTranslate from '@/hooks/useTranslate.ts';
import ProModal from '@/components/pro-modal';
import { useState } from 'react';
import { Form } from 'antd';
import OperationForm from '@/components/operation-form';

const useNewEntry = () => {
  const formatMessage = useTranslate();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const onNewModalOpen = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const formItemOptions = () => [
    {
      label: formatMessage('common.name'),
      name: 'key',
      rules: [{ required: true, message: formatMessage('rule.required') }],
    },
    {
      label: formatMessage('uns.description'),
      name: 'description',
    },
    {
      type: 'divider',
    },
  ];
  const onSave = () => {};
  const NewEntryModal = (
    <ProModal size="xxs" title={formatMessage('Localization.newEntry')} open={open} onCancel={onClose}>
      <OperationForm
        formConfig={{
          layout: 'vertical',
          labelCol: { span: 24 },
          wrapperCol: { span: 24 },
        }}
        buttonConfig={{
          block: true,
        }}
        style={{ padding: 0 }}
        // loading={loading}
        form={form}
        onCancel={onClose}
        onSave={onSave}
        formItemOptions={formItemOptions()}
      />
    </ProModal>
  );

  return {
    NewEntryModal,
    onNewModalOpen,
  };
};

export default useNewEntry;
