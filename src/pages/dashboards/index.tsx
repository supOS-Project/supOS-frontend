import { FC, useState } from 'react';
import { App, Form, Pagination } from 'antd';
// import dashboardGrey from '@/assets/dashboard/dashboard-gray.svg';
// import dashboardBlue from '@/assets/dashboard/dashboard-blue.svg';
// import dashboardGreen from '@/assets/dashboard/dashboard-green.svg';
// import dashboardDark from '@/assets/dashboard/dashboard-dark.svg';
import { useNavigate } from 'react-router-dom';
import { getDashboardList, addDashboard, editDashboard, deleteDashboard } from '@/apis/inter-api/uns';
import { usePagination, useTranslate } from '@/hooks';
import { useActivate } from '@/contexts/tabs-lifecycle-context';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { PageProps } from '@/common-types.ts';
import { Dashboard, Search } from '@carbon/icons-react';
import ComCardListVertical from '@/components/com-card-list-vertical';
import ComDrawer from '@/components/com-drawer';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import ComSearch from '@/components/com-search';
import OperationForm from '@/components/operation-form';
import { validInputPattern } from '@/utils/pattern';
import { getSearchParamsString } from '@/utils/url-util';
import { useBaseStore } from '@/stores/base';
import { AuthButton } from '@/components/auth';
import { DeleteOutlined } from '@ant-design/icons';
// import { useThemeStore } from '@/stores/theme-store.ts';

const CollectionFlow: FC<PageProps> = ({ title }) => {
  const { modal } = App.useApp();
  const formatMessage = useTranslate();
  const dashboardType = useBaseStore((state) => state.dashboardType);
  // const theme = useThemeStore((state) => state.theme);

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [clickItem, setClickItem] = useState<any>({});
  const { loading, pagination, data, reload, refreshRequest, setSearchParams } = usePagination({
    fetchApi: getDashboardList,
  });

  const typeOptions = [
    {
      label: 'Grafana',
      value: 1,
      key: 'grafana',
    },
    {
      label: 'Fuxa',
      value: 2,
      key: 'fuxa',
    },
  ]?.filter((f) => dashboardType?.includes(f.key));

  const formItemOptions = (isEdit: boolean) => {
    return [
      {
        label: `${isEdit ? formatMessage('common.edit') : formatMessage('common.create')} DashBoard`,
      },
      {
        label: formatMessage('common.name'),
        name: 'name',
        rules: [
          { required: true, message: '' },
          { pattern: validInputPattern, message: '' },
        ],
      },
      {
        label: formatMessage('dashboards.dashboardsTemplate'),
        name: 'type',
        type: 'Select',
        properties: {
          options: typeOptions,
          disabled: isEdit,
        },
        rules: [{ required: true, message: '' }],
      },
      {
        label: formatMessage('uns.description'),
        name: 'description',
      },
      {
        type: 'divider',
      },
    ];
  };
  useActivate(() => {
    refreshRequest?.();
  });

  const onClose = () => {
    setShow(false);
    form.resetFields();
  };
  const onAddHandle = () => {
    form.resetFields();
    setIsEdit(false);
    if (show) return;
    setShow(true);
  };
  const onDeleteHandle = (item: any) => {
    deleteDashboard(item.id)
      .then(() => {
        reload();
      })
      .catch(() => {});
  };
  const edit = (item: any) => {
    form.setFieldsValue({ name: item.name, type: item.type || 1, description: item.description });
    setShow(true);
    setClickItem(item);
  };

  const onSave = () => {
    form
      .validateFields()
      .then((info) => {
        const params = info;
        if (isEdit) {
          params.id = clickItem.id;
        }
        const request = isEdit ? editDashboard : addDashboard;
        request(params)
          .then(() => {
            onClose();
            refreshRequest();
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

  const onEditHandle = (item: any) => {
    setIsEdit(true);
    edit(item);
  };

  return (
    <ComLayout loading={loading}>
      <ComContent
        mustHasBack={false}
        title={title}
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
              onSearch={() => setSearchParams(searchForm.getFieldsValue())}
            />
            <AuthButton auth={ButtonPermission['dashboards.add']} type="primary" onClick={onAddHandle}>
              + {formatMessage('dashboards.newDashboard')}
            </AuthButton>
          </>
        }
      >
        <ComCardListVertical
          style={{ flex: 1 }}
          // addAuth={ButtonPermission['dashboards.add']}
          // onAddHandle={onAddHandle}
          editAuth={ButtonPermission['dashboards.edit']}
          onEditHandle={onEditHandle}
          list={(data || []).map((e: any) => {
            return {
              ...e,
              typeName: e.type
                ? typeOptions.find((o) => o.value === e.type)?.label
                : typeOptions.find((o) => o.value === 1)?.label,
            };
          })}
          cardIcon={<Dashboard size="40" />}
          // imgSrc={theme.includes('dark') ? dashboardDark : dashboardGrey}
          // hoverImgSrc={
          //   theme.includes('dark') ? dashboardDark : theme.includes('chartreuse') ? dashboardGreen : dashboardBlue
          // }
          viewOptions={[
            {
              label: formatMessage('dashboards.dashboardsTemplate'),
              valueKey: 'typeName',
            },
            {
              label: formatMessage('uns.description'),
              valueKey: 'description',
            },
          ]}
          operationOptions={[
            {
              label: formatMessage('dashboards.preview'),
              onClick: (item: any) => {
                setClickItem(item);
                navigate(
                  `/dashboards/preview?${getSearchParamsString({ id: item.id, type: item.type, status: 'preview', name: item.name })}`
                );
              },
              type: 'outlined',
              auth: ButtonPermission['dashboards.preview'],
            },
            {
              label: formatMessage('common.design'),
              onClick: (item: any) => {
                setClickItem(item);
                navigate(
                  `/dashboards/preview?${getSearchParamsString({ id: item.id, type: item.type, status: 'design', name: item.name })}`
                );
              },
              type: 'primary',
              auth: ButtonPermission['dashboards.design'],
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
              auth: ButtonPermission['dashboards.delete'],
            },
          ]}
        />
        <Pagination
          size="small"
          className="custom-pagination"
          align="center"
          style={{ margin: '20px 0' }}
          pageSize={pagination?.pageSize || 20}
          current={pagination?.page}
          showSizeChanger={false}
          total={pagination?.total}
          onChange={pagination.onChange}
        />
        {/*  <SvgIcon name="up-dark" /> */}
      </ComContent>
      <ComDrawer title=" " open={show} onClose={onClose}>
        <OperationForm form={form} onCancel={onClose} onSave={onSave} formItemOptions={formItemOptions(isEdit)} />
      </ComDrawer>
    </ComLayout>
  );
};

export default CollectionFlow;
