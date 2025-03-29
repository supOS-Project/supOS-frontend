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
import dashboardGrey from '@/assets/dashboard/dashboard-gray.svg';
import dashboardBlue from '@/assets/dashboard/dashboard-blue.svg';
import dashboardGreen from '@/assets/dashboard/dashboard-green.svg';
import dashboardDark from '@/assets/dashboard/dashboard-dark.svg';
import { useNavigate } from 'react-router-dom';
import { getDashboardList, addDashboard, editDashboard, deleteDashboard } from '@/apis/inter-api/uns';
import { usePagination, useTranslate } from '@/hooks';
import ThemeStore from '@/stores/theme-store';
import { useActivate } from '@/contexts/tabs-lifecycle-context';
import { validInputPattern, getSearchParamsString } from '@/utils';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { PageProps } from '@/common-types.ts';
import { Search } from '@carbon/icons-react';
import { useRoutesContext } from '@/contexts/routes-context.ts';
import { observer } from 'mobx-react-lite';
const CollectionFlow: FC<PageProps> = ({ title }) => {
  const formatMessage = useTranslate();
  const { dashboardType } = useRoutesContext();

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
            onSearch={() => setSearchParams(searchForm.getFieldsValue())}
          />
        }
      >
        <ComCardList
          style={{ flex: 1 }}
          addAuth={ButtonPermission['dashboards.add']}
          deleteAuth={ButtonPermission['dashboards.delete']}
          onAddHandle={onAddHandle}
          list={(data || []).map((e: any) => {
            return {
              ...e,
              typeName: e.type
                ? typeOptions.find((o) => o.value === e.type)?.label
                : typeOptions.find((o) => o.value === 1)?.label,
            };
          })}
          imgSrc={ThemeStore.theme.includes('dark') ? dashboardDark : dashboardGrey}
          hoverImgSrc={
            ThemeStore.theme.includes('dark')
              ? dashboardDark
              : ThemeStore.theme.includes('chartreuse')
                ? dashboardGreen
                : dashboardBlue
          }
          onDeleteHandle={onDeleteHandle}
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
              label: formatMessage('common.edit'),
              onClick: (item: any) => {
                setIsEdit(true);
                edit(item);
              },
              type: 'block',
              auth: ButtonPermission['dashboards.edit'],
            },
            {
              label: formatMessage('collectionFlow.design'),
              onClick: (item: any) => {
                setClickItem(item);
                navigate(
                  `/dashboards-preview?${getSearchParamsString({ id: item.id, type: item.type, status: 'design', name: item.name })}`
                );
              },
              type: 'blue',
              auth: ButtonPermission['dashboards.design'],
            },
            {
              label: formatMessage('dashboards.preview'),
              onClick: (item: any) => {
                setClickItem(item);
                navigate(
                  `/dashboards-preview?${getSearchParamsString({ id: item.id, type: item.type, status: 'preview', name: item.name })}`
                );
              },
              type: 'blue',
              auth: ButtonPermission['dashboards.preview'],
            },
          ]}
        />
        <ComPaginationNav {...pagination} />
        {/*  <SvgIcon name="up-dark" /> */}
      </ComContent>
      <ComDrawer title=" " open={show} onClose={onClose}>
        <OperationForm form={form} onCancel={onClose} onSave={onSave} formItemOptions={formItemOptions(isEdit)} />
      </ComDrawer>
    </ComLayout>
  );
};

export default observer(CollectionFlow);
