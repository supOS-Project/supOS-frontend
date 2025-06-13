import { FC, useState } from 'react';
import { App, Form, Pagination } from 'antd';
// import flowGrey from '@/assets/collection-flow/flow-grey.svg';
// import flowBlue from '@/assets/collection-flow/flow-blue.svg';
// import flowGreen from '@/assets/collection-flow/flow-green.svg';
// import flowDark from '@/assets/collection-flow/flow-dark.svg';
import { useNavigate } from 'react-router-dom';
import { addFlow, copyFlow, deleteFlow, editFlow, flowPage } from '@/apis/inter-api/flow';
import { usePagination, useTranslate } from '@/hooks';
import { PageProps } from '@/common-types.ts';
import { useActivate } from '@/contexts/tabs-lifecycle-context';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { Search } from '@carbon/icons-react';
import ComCardListVertical from '@/components/com-card-list-vertical';
import ComDrawer from '@/components/com-drawer';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import ComSearch from '@/components/com-search';
import OperationForm from '@/components/operation-form';
import { validInputPattern } from '@/utils/pattern';
import { TransformFieldNameOutData } from '@/utils/transform';
import { getSearchParamsString } from '@/utils/url-util';
import { AuthButton } from '@/components/auth';
import { DeleteOutlined } from '@ant-design/icons';
// import { useThemeStore } from '@/stores/theme-store.ts';

const CollectionFlow: FC<PageProps> = ({ title }) => {
  const { modal } = App.useApp();
  // const theme = useThemeStore((state) => state.theme);
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
        { required: true, message: formatMessage('rule.required') },
        { pattern: validInputPattern, message: formatMessage('rule.illegality') },
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
  const onEditHandle = (item: any) => {
    setIsEdit('edit');
    setShow(true);
    form.setFieldsValue({
      ...item,
      flowName: item.name,
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
          <>
            <ComSearch
              form={searchForm}
              formItemOptions={[
                {
                  name: 'k',
                  properties: {
                    prefix: <Search />,
                    placeholder: formatMessage('common.searchPlaceholder'),
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
            <AuthButton auth={ButtonPermission['collectionFlow.add']} type="primary" onClick={onAddHandle}>
              + {formatMessage('collectionFlow.newFlow')}
            </AuthButton>
          </>
        }
      >
        <ComCardListVertical
          style={{ flex: 1 }}
          // addAuth={ButtonPermission['collectionFlow.add']}
          // onAddHandle={onAddHandle}
          editAuth={ButtonPermission['collectionFlow.edit']}
          onEditHandle={onEditHandle}
          list={TransformFieldNameOutData(data, {
            status: 'flowStatus',
            name: 'flowName',
            type: 'template',
          })}
          // imgSrc={theme.includes('dark') ? flowDark : flowGrey}
          // hoverImgSrc={theme.includes('dark') ? flowDark : theme.includes('chartreuse') ? flowGreen : flowBlue}
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
              label: formatMessage('common.copy'),
              onClick: (item: any) => {
                setIsEdit('copy');
                setShow(true);
                form.setFieldsValue({
                  id: item.id,
                });
              },
              type: 'outlined',
              auth: ButtonPermission['collectionFlow.copy'],
            },
            {
              label: formatMessage('common.design'),
              onClick: (item: any) => {
                navigate(
                  `/collection-flow/flow-editor?${getSearchParamsString({ id: item.id, name: item.name, status: item.status, flowId: item.flowId })}`
                );
              },
              type: 'primary',
              auth: ButtonPermission['collectionFlow.design'],
            },
            {
              label: formatMessage('common.delete'),
              onClick: (item) =>
                modal.confirm({
                  title: formatMessage('common.deleteConfirm'),
                  onOk: () => onDeleteHandle(item),
                  okText: formatMessage('common.confirm'),
                }),
              type: 'dark',
              btnProps: {
                icon: <DeleteOutlined />,
              },
              auth: ButtonPermission['collectionFlow.delete'],
            },
          ]}
        />
        <Pagination
          size="small"
          className="custom-pagination"
          align="center"
          style={{ margin: '20px 0' }}
          total={pagination?.total}
          showSizeChanger={false}
          onChange={pagination.onChange}
          pageSize={pagination?.pageSize || 20}
          current={pagination?.page}
        />
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
