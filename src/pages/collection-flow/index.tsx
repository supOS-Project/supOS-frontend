import { FC, useState } from 'react';
import {
  ComLayout,
  ComContent,
  OperationForm,
  ComCardList,
  ComPaginationNav,
  ComDrawer,
  ComSearch,
} from '@/components';
import { Form } from 'antd';
import flowGrey from '@/assets/collection-flow/flow-grey.svg';
import flowBlue from '@/assets/collection-flow/flow-blue.svg';
import flowGreen from '@/assets/collection-flow/flow-green.svg';
import flowDark from '@/assets/collection-flow/flow-dark.svg';
import { useNavigate } from 'react-router-dom';
import { addFlow, copyFlow, deleteFlow, editFlow, flowPage } from '@/apis/inter-api/flow';
import { TransformFieldNameOutData, validInputPattern, getSearchParamsString } from '@/utils';
import { usePagination, useTranslate } from '@/hooks';
import { PageProps } from '@/common-types.ts';
import { useActivate } from '@/contexts/tabs-lifecycle-context';
import ThemeStore from '@/stores/theme-store';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { Search } from '@carbon/icons-react';

const CollectionFlow: FC<PageProps> = ({ title }) => {
  const formatMessage = useTranslate();
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState('create');
  const [apiLoading, setApiLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [show, setShow] = useState(false);
  const { loading, pagination, data, reload, refreshRequest, setSearchParams } = usePagination({
    fetchApi: flowPage,
  });
  const formItemOptions = (isEdit: string) => [
    {
      label: `${formatMessage(`common.${isEdit}`)} Flow`,
    },
    {
      label: formatMessage('common.name'),
      name: 'flowName',
      rules: [
        { required: true, message: '' },
        { pattern: validInputPattern, message: '' },
      ],
    },
    {
      label: formatMessage('collectionFlow.flowTemplate'),
      name: 'template',
      type: 'Select',
      properties: {
        options: [
          {
            label: 'node-red',
            value: 'node-red',
          },
        ],
        disabled: isEdit !== 'create',
      },
      initialValue: 'node-red',
      rules: [{ required: true, message: '' }],
    },
    {
      label: formatMessage('uns.description'),
      name: 'description',
    },
    {
      label: 'id',
      name: 'id',
      hidden: true,
    },
    {
      type: 'divider',
    },
  ];
  useActivate(() => {
    refreshRequest?.();
  });
  const onClose = () => {
    setShow(false);
    form.resetFields();
  };
  const onAddHandle = () => {
    setIsEdit('create');
    form.resetFields();
    if (show) return;
    setShow(true);
  };
  const onSave = async () => {
    const values = await form.validateFields();
    setApiLoading(true);
    const apiObj: any = {
      copy: copyFlow,
      edit: editFlow,
      create: addFlow,
    };
    const api = apiObj[isEdit || 'create'];
    api({
      ...values,
      template: isEdit === 'edit' ? undefined : values.template,
      id: isEdit === 'edit' ? values.id : undefined,
      sourceId: isEdit === 'copy' ? values.id : undefined,
    })
      .then(() => {
        refreshRequest();
        onClose();
      })
      .finally(() => {
        setApiLoading(false);
      });
  };
  const onDeleteHandle = (item: any) => {
    deleteFlow(item.id).then(() => {
      reload();
    });
  };
  return (
    <ComLayout loading={loading}>
      <ComContent
        title={title}
        mustHasBack={false}
        style={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        extra={
          <ComSearch
            form={searchForm}
            formItemOptions={[
              {
                name: 'k',
                properties: {
                  prefix: <Search />,
                  placeholder: formatMessage('uns.inputText'),
                  style: { width: 300 },
                  allowClear: true,
                },
              },
            ]}
            formConfig={{
              onFinish: () => {
                setSearchParams(searchForm.getFieldsValue());
              },
            }}
            onSearch={() => {
              setSearchParams(searchForm.getFieldsValue());
            }}
          />
        }
      >
        <ComCardList
          style={{ flex: 1 }}
          addAuth={ButtonPermission['collectionFlow.add']}
          deleteAuth={ButtonPermission['collectionFlow.delete']}
          onAddHandle={onAddHandle}
          onDeleteHandle={onDeleteHandle}
          list={TransformFieldNameOutData(data, {
            status: 'flowStatus',
            name: 'flowName',
            type: 'template',
          })}
          imgSrc={ThemeStore.theme.includes('dark') ? flowDark : flowGrey}
          hoverImgSrc={
            ThemeStore.theme.includes('dark')
              ? flowDark
              : ThemeStore.theme.includes('chartreuse')
                ? flowGreen
                : flowBlue
          }
          runStatusOptions={[
            {
              value: 'RUNNING',
              text: formatMessage('common.running'),
              bgType: 'green',
            },
            {
              value: 'PENDING',
              text: formatMessage('common.pending'),
              bgType: 'purple',
            },
            {
              value: 'STOPPED',
              text: formatMessage('common.stopped'),
              bgType: 'red',
            },
            {
              value: 'DRAFT',
              text: formatMessage('common.draft'),
              bgType: 'blue',
            },
          ]}
          operationOptions={[
            {
              label: formatMessage('collectionFlow.copy'),
              onClick: (item: any) => {
                setIsEdit('copy');
                setShow(true);
                form.setFieldsValue({
                  id: item.id,
                });
              },
              type: 'block',
              auth: ButtonPermission['collectionFlow.copy'],
            },
            {
              label: formatMessage('collectionFlow.edit'),
              onClick: (item: any) => {
                setIsEdit('edit');
                setShow(true);
                form.setFieldsValue({
                  ...item,
                  flowName: item.name,
                });
              },
              type: 'block',
              auth: ButtonPermission['collectionFlow.edit'],
            },
            {
              label: formatMessage('collectionFlow.design'),
              onClick: (item: any) => {
                navigate(
                  `/flow-editor?${getSearchParamsString({ id: item.id, name: item.name, status: item.status, flowId: item.flowId })}`
                );
              },
              type: 'blue',
              auth: ButtonPermission['collectionFlow.design'],
            },
          ]}
        />
        <ComPaginationNav {...pagination} />
      </ComContent>
      <ComDrawer title=" " open={show} onClose={onClose}>
        <OperationForm
          loading={apiLoading}
          form={form}
          onCancel={onClose}
          onSave={onSave}
          formItemOptions={formItemOptions(isEdit)}
        />
      </ComDrawer>
    </ComLayout>
  );
};

export default CollectionFlow;
