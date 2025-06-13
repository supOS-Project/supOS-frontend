import { useTranslate } from '@/hooks';
import { memo, useEffect, useMemo, useState } from 'react';
import Icon from '@ant-design/icons';
import { App, Form } from 'antd';
import ExpandedKeyFormList from '@/pages/uns/components/ExpandedKeyFormList.tsx';
import { makeLabel, modifyDetail } from '@/apis/inter-api/uns.ts';
import { AuthButton } from '@/components/auth';
import OperationForm from '@/components/operation-form';
import ProModal from '@/components/pro-modal';
import FileEdit from '@/components/svg-components/FileEdit';

const extendToArr = (extend: { [key: string]: string }) => {
  if (!extend) return undefined;
  const arr: { key: string; value: string }[] = [];
  Object.keys(extend).forEach((item) => {
    arr.push({
      key: item,
      value: extend[item],
    });
  });
  return arr;
};

const extendToObj = (extend: { key: string; value: string }[]) => {
  if (!extend) return undefined;
  const obj: { [key: string]: string } = {};
  extend.forEach((item) => {
    obj[item.key] = item.value;
  });
  return obj;
};

const EditDetailButton = ({ auth, type = 'file', modelInfo, getModel }: any) => {
  const formatMessage = useTranslate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [form] = Form.useForm();

  const onClose = () => {
    setShow(false);
  };

  useEffect(() => {
    if (show) {
      form.setFieldsValue({
        ...modelInfo,
        extend: extendToArr(modelInfo?.extend),
        labelList: modelInfo?.labelList?.map((i: any) => ({ ...i, label: i.labelName, value: i.id })),
      });
    }
  }, [show]);

  const onSave = async () => {
    const info = await form.validateFields();
    setLoading(true);
    modifyDetail({
      ...info,
      extend: extendToObj(info?.extend),
      pathType: type === 'file' ? 2 : 0,
      save2db: type !== 'file' ? undefined : info?.withSave2db,
      withSave2db: undefined,
      labelList: undefined,
      pathName: undefined,
    })
      .then(() => {
        setShow(false);
        message.success(formatMessage('uns.editSuccessful'));
        if (type === 'file') {
          makeLabel(
            info.id,
            info?.labelList?.map(({ label, value }: { label: string; value: string | number }) => ({
              ...(label ? { id: value } : { labelName: value }),
            })) || []
          ).finally(() => {
            getModel?.(info);
          });
        } else {
          getModel?.(info);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const formItemOptions = useMemo(() => {
    return [
      {
        label: formatMessage('common.name'),
        name: 'pathName',
        properties: {
          disabled: true,
        },
      },
      {
        hidden: true,
        name: 'name',
        properties: {
          disabled: true,
        },
      },
      {
        name: 'id',
        hidden: true,
        properties: {
          disabled: true,
        },
      },
      {
        name: 'dataType',
        hidden: true,
        properties: {
          disabled: true,
        },
        noShowKey: 'folder',
      },
      {
        name: 'fields',
        hidden: true,
        properties: {
          disabled: true,
        },
        noShowKey: 'folder',
      },
      {
        label: formatMessage('uns.alias'),
        name: 'alias',
        properties: {
          disabled: true,
        },
      },
      {
        label: formatMessage('uns.displayName'),
        name: 'displayName',
        rules: [{ max: 128 }],
      },
      {
        type: 'TextArea',
        label: type === 'file' ? formatMessage('uns.fileDescription') : formatMessage('uns.folderDescription'),
        name: 'description',
        rules: [{ max: 255 }],
      },
      {
        type: 'Checkbox',
        name: 'withSave2db',
        properties: {
          label: formatMessage('uns.persistence'),
          style: { marginLeft: 5 },
        },
        noShowKey: modelInfo.dataType === 7 ? 'hidden' : 'folder',
        valuePropName: 'checked',
      },
      {
        type: 'TagSelect',
        label: formatMessage('common.label'),
        name: 'labelList',
        noShowKey: modelInfo.dataType === 7 ? 'hidden' : 'folder',
      },
      {
        type: 'divider',
      },
      {
        render: () => <ExpandedKeyFormList />,
      },
    ].filter((f: any) => (!f.noShowKey || f.noShowKey !== type) && f.noShowKey !== 'hidden');
  }, [type, modelInfo.dataType]);

  return (
    <>
      <AuthButton
        auth={auth}
        onClick={() => setShow(true)}
        style={{ border: '1px solid #C6C6C6', background: 'var(--supos-uns-button-color)' }}
        icon={
          <Icon
            data-button-auth={auth}
            component={FileEdit}
            style={{
              fontSize: 16,
              color: 'var(--supos-text-color)',
            }}
          />
        }
      />
      <ProModal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{formatMessage('uns.editDetails')}</span>
          </div>
        }
        onCancel={onClose}
        open={show}
        size="xs"
        afterClose={() => {
          form.resetFields();
        }}
      >
        <OperationForm
          formConfig={{
            layout: 'vertical',
            labelCol: { span: undefined },
            wrapperCol: { span: undefined },
          }}
          style={{ padding: 0 }}
          form={form}
          onCancel={onClose}
          onSave={onSave}
          formItemOptions={formItemOptions}
          buttonConfig={{ block: true }}
          loading={loading}
        />
      </ProModal>
    </>
  );
};

export default memo(EditDetailButton, (pre, cur) => {
  return pre.modelInfo === cur.modelInfo;
});
