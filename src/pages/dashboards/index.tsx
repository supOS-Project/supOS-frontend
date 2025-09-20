import { FC, useState } from 'react';
import { App, Button, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getDashboardList, addDashboard, editDashboard, deleteDashboard } from '@/apis/inter-api/uns';
import { usePagination, useTranslate } from '@/hooks';
import { useActivate } from '@/contexts/tabs-lifecycle-context';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { PageProps } from '@/common-types.ts';
import { Edit, Search, TrashCan, View } from '@carbon/icons-react';
import ComDrawer from '@/components/com-drawer';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import ComSearch from '@/components/com-search';
import OperationForm from '@/components/operation-form';
import { validInputPattern } from '@/utils/pattern';
import { getSearchParamsString } from '@/utils/url-util';
import { useBaseStore } from '@/stores/base';
import { AuthButton, AuthWrapper } from '@/components/auth';
import { ComTableList } from '@/components';
import OperationButtons from '@/components/operation-buttons';
import './index.scss';

const CollectionFlow: FC<PageProps> = ({ title }) => {
  const { modal } = App.useApp();
  const formatMessage = useTranslate();
  const dashboardType = useBaseStore((state) => state.dashboardType);

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
        label: `${isEdit ? formatMessage('common.edit') : formatMessage('common.create')} ${formatMessage('dashboards.dashboard')}`,
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
          padding: '30px',
          overflow: 'hidden',
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
            <AuthButton auth={ButtonPermission['Dashboards.add']} type="primary" onClick={onAddHandle}>
              + {formatMessage('dashboards.newDashboard')}
            </AuthButton>
          </>
        }
      >
        <ComTableList
          className="dashboard-table-list"
          columns={[
            {
              titleIntlId: 'common.name',
              dataIndex: 'name',
              width: '30%',
              render: (text: any, item: any) => (
                <>
                  <AuthWrapper auth={ButtonPermission['Dashboards.design']}>
                    <Button
                      type="link"
                      onClick={() => {
                        setClickItem(item);
                        navigate(
                          `/dashboards/preview?${getSearchParamsString({ id: item.id, type: item.type, status: 'design', name: item.name })}`
                        );
                      }}
                      title={text}
                    >
                      {text}
                    </Button>
                  </AuthWrapper>
                </>
              ),
            },
            {
              titleIntlId: 'dashboards.dashboardsTemplate',
              dataIndex: 'typeName',
              width: '25%',
            },
            {
              titleIntlId: 'common.description',
              dataIndex: 'description',
              width: '30%',
              ellipsis: true,
            },
            {
              title: '',
              dataIndex: 'operation',
              width: '10%',
              align: 'right',
              fixed: 'right',
              render: (_: any, record: any) => (
                <OperationButtons
                  className="list-operation"
                  options={[
                    {
                      label: '',
                      onClick: (item: any) => {
                        setClickItem(item);
                        navigate(
                          `/dashboards/preview?${getSearchParamsString({ id: item.id, type: item.type, status: 'preview', name: item.name })}`
                        );
                      },
                      type: 'link',
                      btnProps: {
                        title: formatMessage('dashboards.preview'),
                        icon: <View />,
                      },
                      auth: ButtonPermission['Dashboards.preview'],
                    },
                    {
                      label: '',
                      onClick: onEditHandle,
                      type: 'link',
                      btnProps: {
                        title: formatMessage('common.edit'),
                        icon: <Edit />,
                      },
                      auth: ButtonPermission['Dashboards.edit'],
                    },
                    {
                      label: '',
                      onClick: (item) =>
                        modal.confirm({
                          title: formatMessage('common.deleteConfirm'),
                          onOk: () => onDeleteHandle(item),
                          okButtonProps: {
                            title: formatMessage('common.confirm'),
                          },
                          cancelButtonProps: {
                            title: formatMessage('common.cancel'),
                          },
                        }),
                      type: 'link',
                      btnProps: {
                        title: formatMessage('common.delete'),
                        icon: <TrashCan />,
                      },
                      auth: ButtonPermission['Dashboards.delete'],
                    },
                  ]}
                  record={record}
                />
              ),
            },
          ]}
          dataSource={(data || []).map((e: any) => {
            return {
              ...e,
              typeName: e.type
                ? typeOptions.find((o) => o.value === e.type)?.label
                : typeOptions.find((o) => o.value === 1)?.label,
            };
          })}
          pagination={pagination}
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
