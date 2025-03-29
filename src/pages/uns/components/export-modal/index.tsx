import { FC, useState, useImperativeHandle } from 'react';
import { ProModal, ComCheckbox } from '@/components';
import { Button, Form, App } from 'antd';
import SearchSelect from '@/pages/uns/components/use-create-modal/components/SearchSelect';
import { exportExcel } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';

const Module: FC<any> = (props) => {
  const { exportRef } = props;
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const all = Form.useWatch('all', form);

  const formatMessage = useTranslate();

  const save = async () => {
    const values = await form.validateFields();
    console.log('values', values);
    const { models, instances, all } = values;
    if (models.length === 0 && instances.length === 0 && !all) {
      message.warning(formatMessage('uns.pleaseSelectTheInstanceToExport'));
      return;
    }
    const _instances = instances.length
      ? instances.filter((instance: string) => !models.some((model: string) => instance.startsWith(model)))
      : [];
    setLoading(true);
    try {
      const filePath = await exportExcel(all ? { exportType: 'ALL' } : { models, instances: _instances });
      if (filePath) {
        window.open(`/inter-api/supos/uns/excel/download?path=${filePath}`, '_self');
        message.success(formatMessage('uns.exportSuccessful'));
        setLoading(false);
        close();
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    if (!loading) {
      form.resetFields();
    }
  };
  useImperativeHandle(exportRef, () => ({
    setOpen: setOpen,
  }));

  return (
    <ProModal
      className="exportModalWrap"
      open={open}
      onCancel={close}
      title={formatMessage('uns.export')}
      width={500}
      maskClosable={false}
      keyboard={false}
    >
      <Form
        name="exportForm"
        form={form}
        colon={false}
        style={{ color: 'var(--supos-text-color)', maxHeight: '300px', overflowY: 'auto' }}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        labelAlign="left"
        labelWrap
        initialValues={{ models: [], instances: [], all: false }}
        disabled={loading}
      >
        <Form.Item name="all" label={formatMessage('uns.downloadAll')} valuePropName="checked">
          <ComCheckbox
            onChange={() => {
              form.setFieldsValue({ models: [], instances: [] });
            }}
            disabled={loading}
          />
        </Form.Item>
        <Form.Item label={formatMessage('uns.model')} name="models">
          <SearchSelect
            placeholder={formatMessage('uns.exportFolderTip')}
            type={0}
            mode="multiple"
            disabled={all}
            normal
            popupMatchSelectWidth={500}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage('uns.instance')}
          name="instances"
          tooltip={{
            title: formatMessage('uns.exportFileToolTip'),
            zIndex: 10000,
          }}
        >
          <SearchSelect
            placeholder={formatMessage('uns.exportFileTip')}
            type={2}
            mode="multiple"
            disabled={all}
            normal
            popupMatchSelectWidth={500}
          />
        </Form.Item>
      </Form>
      <Button
        className="exportConfirm"
        color="primary"
        variant="solid"
        onClick={save}
        block
        style={{ marginTop: '10px' }}
        loading={loading}
        disabled={loading}
      >
        {formatMessage('common.confirm')}
      </Button>
    </ProModal>
  );
};
export default Module;
