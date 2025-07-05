import { FC, useState, useImperativeHandle } from 'react';
import { Button, Form, App, Select, TreeSelect } from 'antd';
import { exportExcel, getTreeData, getUnsLazyTree } from '@/apis/inter-api/uns';
import { useTranslate } from '@/hooks';

import type { RefObject, Dispatch, SetStateAction } from 'react';
import ProModal from '@/components/pro-modal';
import { ProTreeSelect } from '@/components';
import { CustomAxiosConfigEnum } from '@/utils';
import { Document, Folder, FolderOpen } from '@carbon/icons-react';
import { useBaseStore } from '@/stores/base';
import { getParamsForArray } from '@/utils/uns.ts';

interface ExportModalRef {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface ExportModalProps {
  exportRef?: RefObject<ExportModalRef>;
}
const { SHOW_PARENT } = TreeSelect;

const Module: FC<ExportModalProps> = (props) => {
  const { exportRef } = props;
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const { lazyTree } = useBaseStore((state) => ({
    lazyTree: state.systemInfo?.lazyTree,
  }));

  const formatMessage = useTranslate();

  const save = async () => {
    const values = await form.validateFields();
    const { uns, fileType } = values;
    const params = getParamsForArray(uns, 'type', {
      groups: {
        0: 'models',
        2: 'instances',
      },
      extract: 'value',
    });
    if (!params?.models?.length && !params?.instances?.length && !params?.exportType) {
      message.warning(formatMessage('uns.pleaseSelectTheInstanceToExport'));
      return;
    }

    setLoading(true);
    try {
      const filePath = await exportExcel({
        fileType,
        ...params,
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
        initialValues={{ uns: [], all: false }}
        disabled={loading}
      >
        <Form.Item name="fileType" label={formatMessage('uns.fileType')} initialValue={'excel'}>
          <Select
            options={[
              { label: 'EXCEL', value: 'excel' },
              { label: 'JSON', value: 'json' },
            ]}
          />
        </Form.Item>
        <Form.Item label={formatMessage('home.uns')} name="uns">
          <ProTreeSelect
            showSearch={false}
            loadDataEnable
            lazy={lazyTree}
            listHeight={350}
            maxTagCount="responsive"
            showSwitcherIcon
            treeCheckable
            popupMatchSelectWidth={700}
            fieldNames={{ label: 'pathName', value: 'id' }}
            showCheckedStrategy={SHOW_PARENT}
            api={(params, config) =>
              lazyTree
                ? getUnsLazyTree(
                    {
                      parentId: params?.key,
                      keyword: params?.searchValue,
                      pageSize: params!.pageSize!,
                      pageNo: params!.pageNo!,
                      searchType: 1,
                    },
                    {
                      [CustomAxiosConfigEnum.BusinessResponse]: true,
                      ...config,
                    }
                  ).then((info: any) => {
                    return {
                      ...info,
                      data: info.data?.map((item: any) => ({
                        ...item,
                        isLeaf: !item.hasChildren,
                        key: item.id,
                      })),
                    };
                  })
                : getTreeData({ key: params?.searchValue }).then((data: any) => {
                    return {
                      data,
                    };
                  })
            }
            treeNodeIcon={(dataNode: any, _treeExpandedKeys = []) => {
              if (dataNode.type === 0) {
                return _treeExpandedKeys.includes(dataNode.key!) ? (
                  <FolderOpen style={{ flexShrink: 0, marginRight: '5px' }} />
                ) : (
                  <Folder style={{ flexShrink: 0, marginRight: '5px' }} />
                );
              } else if (dataNode.type === 2) {
                return <Document style={{ flexShrink: 0, marginRight: '5px' }} />;
              }
              return null;
            }}
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
