import { useCallback, useState } from 'react';
import { Button, Form, App } from 'antd';
import { WarningFilled } from '@carbon/icons-react';
import { deleteTreeNode } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';

import type { UnsTreeNode, InitTreeDataFnType } from '@/pages/uns/types';
import ComCheckbox from '@/components/com-checkbox';
import ProModal from '@/components/pro-modal';
import { useBaseStore } from '@/stores/base';

export interface DeleteModalProps {
  successCallBack: InitTreeDataFnType;
  currentNode?: UnsTreeNode;
  setSelectedNode?: any;
  lazyTree?: boolean;
}

const Module = ({ successCallBack, currentNode, lazyTree }: DeleteModalProps) => {
  const formatMessage = useTranslate();
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [deleteDetail, setDeleteDetail] = useState<UnsTreeNode | null>();
  const [loading, setLoading] = useState(false);
  const { message, modal } = App.useApp();
  const dashboardType = useBaseStore((state) => state.dashboardType);

  const setModalOpen = useCallback(
    (detail: UnsTreeNode) => {
      setDeleteDetail(detail);
      setOpen(true);
    },
    [setOpen, setDeleteDetail]
  );

  const close = () => {
    setOpen(false);
    form.resetFields();
    setLoading(false);
  };
  const cancel = () => {
    close();
  };

  const deleteRequest = async (params: any) => {
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
        const clearSelect =
          currentNode?.path?.startsWith(deleteDetail?.path || '') ||
          currentNode?.id === deleteDetail?.id ||
          params.cascade;
        const config = lazyTree ? { reset: true, clearSelect } : { clearSelect };
        successCallBack(config);
        close();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (cascade?: boolean) => {
    const { id, type } = deleteDetail || {};
    if (type === 0) {
      deleteRequest({ cascade, id });
    } else {
      const formData = await form.validateFields();
      const params = { id, ...formData };
      if (cascade) params.cascade = cascade;
      deleteRequest(params);
    }
  };

  const Dom = (
    <ProModal
      aria-label=""
      className="importModalWrap"
      open={open}
      onCancel={close}
      maskClosable={false}
      title={formatMessage(deleteDetail?.type === 2 ? 'uns.deleteFile' : 'uns.deleteFolder')}
      width={460}
    >
      <Form name="deleteForm" form={form} colon={false}>
        {deleteDetail?.type === 2 ? (
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
