import { useState } from 'react';
import { ProModal } from '@/components';
import { Button, Form, App, Input } from 'antd';
import { addLabel } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';

const Module = ({ successCallBack, changeCurrentPath, setTreeMap, scrollTreeNode }: any) => {
  const formatMessage = useTranslate();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const setModalOpen = () => {
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    form.resetFields();
    setLoading(false);
  };

  const confirm = async () => {
    const formData = await form.validateFields();
    if (formData) {
      setLoading(true);
      console.log(formData);
      const { name } = formData;
      addLabel(name)
        .then((data: any) => {
          successCallBack({}, () => {
            changeCurrentPath({ path: data?.id, type: 9 });
            setTreeMap(false);
            scrollTreeNode(data?.id);
          });
          message.success(formatMessage('uns.newSuccessfullyAdded'));
          setLoading(false);
          close();
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const Dom = (
    <ProModal className="labelModalWrap" open={open} onCancel={close} title={formatMessage('uns.newLabel')} size="xxs">
      <Form
        name="addLabelForm"
        form={form}
        colon={false}
        initialValues={{
          withFlow: false,
          withDashboard: true,
        }}
        disabled={loading}
      >
        <Form.Item label={formatMessage('common.name')} name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
      <Button
        className="labelConfirm"
        color="primary"
        variant="solid"
        onClick={confirm}
        block
        style={{ marginTop: '10px' }}
        loading={loading}
        disabled={loading}
      >
        {formatMessage('common.save')}
      </Button>
    </ProModal>
  );
  return {
    LabelModal: Dom,
    setLabelOpen: setModalOpen,
  };
};
export default Module;
