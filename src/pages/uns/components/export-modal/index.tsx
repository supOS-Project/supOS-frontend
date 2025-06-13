import { FC, useState, useImperativeHandle } from 'react';
import { Button, Form, App, Select, Flex } from 'antd';
import SearchSelect from '@/pages/uns/components/use-create-modal/components/SearchSelect';
import { exportExcel } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';

import type { RefObject, Dispatch, SetStateAction } from 'react';
import ComCheckbox from '@/components/com-checkbox';
import ProModal from '@/components/pro-modal';
interface ExportModalRef {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface ExportModalProps {
  exportRef?: RefObject<ExportModalRef>;
}

const Module: FC<ExportModalProps> = (props) => {
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
    const { models, instances, all, fileType } = values;
    if (models.length === 0 && instances.length === 0 && !all) {
      message.warning(formatMessage('uns.pleaseSelectTheInstanceToExport'));
      return;
    }

    setLoading(true);
    try {
      const filePath = await exportExcel({
        fileType,
        ...(all ? { exportType: 'ALL' } : { models, instances }),
      });
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
        <Flex>
          <Form.Item
            name="all"
            label={formatMessage('uns.downloadAll')}
            valuePropName="checked"
            labelCol={{ span: 12 }}
            style={{ width: '50%' }}
          >
            <ComCheckbox
              onChange={() => {
                form.setFieldsValue({ models: [], instances: [] });
              }}
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="fileType"
            label={formatMessage('uns.fileType')}
            initialValue={'excel'}
            labelCol={{ span: 12 }}
            style={{ width: '50%' }}
          >
            <Select
              options={[
                { label: 'EXCEL', value: 'excel' },
                { label: 'JSON', value: 'json' },
              ]}
            />
          </Form.Item>
        </Flex>
        <Form.Item label={formatMessage('uns.model')} name="models">
          <SearchSelect
            placeholder={formatMessage('uns.exportFolderTip')}
            mode="multiple"
            disabled={all}
            popupMatchSelectWidth={500}
            apiParams={{ type: 0, normal: true }}
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
            mode="multiple"
            disabled={all}
            popupMatchSelectWidth={500}
            apiParams={{ type: 2, normal: true }}
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
