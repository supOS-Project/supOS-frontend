import { useState } from 'react';
import { Button, Form, App } from 'antd';
import { WarningFilled } from '@carbon/icons-react';
import { deleteTreeNode } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';
import { ProModal, ComCheckbox } from '@/components';
import { useRoutesContext } from '@/contexts/routes-context.ts';

const Module = ({ successCallBack, currentPath }: any) => {
  const formatMessage = useTranslate();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [deleteDetail, setDeleteDetail] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { message, modal } = App.useApp();
  const { dashboardType } = useRoutesContext();

  const setModalOpen = (detail: any) => {
    setDeleteDetail(detail);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    form.resetFields();
    setLoading(false);
  };
  const cancel = () => {
    close();
  };

  const deleteRequest = async (path: any, params: any) => {
    setLoading(true);
    try {
      const data: any = await deleteTreeNode(params);
      if (data?.refs > 0) {
        modal.confirm({
          content: formatMessage('uns.thisNodeHasAssociatedComputingNodes'),
          cancelText: formatMessage('common.cancel'),
          okText: formatMessage('common.confirm'),
          onOk() {
            confirm(true);
          },
          onCancel() {
            setLoading(false);
          },
        });
      } else {
        message.success(formatMessage('common.deleteSuccessfully'));
        successCallBack({ reset: currentPath.startsWith(path) || params.cascade });
        close();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (cascade: boolean | undefined) => {
    const { path, type } = deleteDetail;
    if (type === 0) {
      deleteRequest(path, { cascade, path });
    } else {
      const formData = await form.validateFields();
      const params = { path, ...formData };
      if (cascade) params.cascade = cascade;
      deleteRequest(path, params);
    }
  };

  const Dom = (
    <ProModal
      aria-label=""
      className="importModalWrap"
      open={open}
      onCancel={close}
      maskClosable={false}
      title={formatMessage(deleteDetail.type === 2 ? 'uns.deleteFile' : 'uns.deleteFolder')}
      width={460}
    >
      <Form name="deleteForm" form={form} colon={false}>
        {deleteDetail.type === 2 ? (
          <>
            <Form.Item
              name="withFlow"
              label=""
              valuePropName="checked"
              initialValue={false}
              style={{ marginBottom: 0 }}
            >
              <ComCheckbox label={formatMessage('uns.deleteAutoFlow')} />
            </Form.Item>
            {dashboardType?.includes('grafana') && (
              <Form.Item
                name="withDashboard"
                label=""
                valuePropName="checked"
                initialValue={true}
                style={{ marginBottom: 0 }}
              >
                <ComCheckbox label={formatMessage('uns.deleteAutoDashboard')} />
              </Form.Item>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', gap: '5px', fontSize: '16px' }}>
            <WarningFilled style={{ color: '#faad14', flexShrink: 0, height: '25px' }} />
            <span>{formatMessage('uns.deleteFolderTip')}</span>
          </div>
        )}
      </Form>
      <div style={{ marginTop: '20px' }}>
        <Button
          color="default"
          variant="filled"
          onClick={cancel}
          style={{ width: '48%', marginRight: '4%' }}
          size="large"
          disabled={loading}
        >
          {formatMessage('common.cancel')}
        </Button>

        <Button
          color="primary"
          variant="solid"
          onClick={() => {
            confirm(undefined);
          }}
          style={{ width: '48%' }}
          size="large"
          loading={loading}
        >
          {formatMessage('common.confirm')}
        </Button>
      </div>
    </ProModal>
  );
  return {
    DeleteModal: Dom,
    setDeleteOpen: setModalOpen,
  };
};
export default Module;
