import {
  ComLayout,
  ComContent,
  ComPaginationNav,
  ComCardList,
  ComDrawer,
  OperationForm,
  ComSearch,
  useInformationModal,
} from '@/components';
import { usePagination, useTranslate } from '@/hooks';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import { Alarm, Search } from '@carbon/icons-react';
import { useActivate } from '@/contexts/tabs-lifecycle-context.ts';
import { getUserManageList } from '@/apis/inter-api/user-manage';
// import { processList } from '@/apis/inter-api/flow';

import { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Flex, Form, Select } from 'antd';
import { validInputPattern } from '@/utils';
import NameSpace from '@/pages/alert/components/NameSpace.tsx';
import Condition from '@/pages/alert/components/Condition.tsx';
import DeadZone from '@/pages/alert/components/DeadZone.tsx';
import { getAlertList } from '@/apis/inter-api/uns.ts';
import { addRule, deleteRule, editRule } from '@/apis/inter-api/alarm.ts';
import { PageProps } from '@/common-types.ts';

const Alert: FC<PageProps> = ({ title }) => {
  const location = useLocation();
  const businessId = location?.state?.businessId;
  const [searchForm] = Form.useForm();
  const formatMessage = useTranslate();
  const [isEdit, setIsEdit] = useState(false);
  const { data: userData } = usePagination({
    initPageSize: 100,
    fetchApi: getUserManageList,
    simple: false,
  });
  // const [optionsData, setOptionsData] = useState<any>(userData && userData);

  // const { data: processData } = usePagination({
  //   initPageSize: 100,
  //   fetchApi: processList,
  //   simple: false,
  // });
  const formItemOptions = [
    {
      label: formatMessage('common.name'),
      name: 'dataPath',
      rules: [
        { required: true, message: formatMessage('rule.required') },
        { pattern: validInputPattern, message: formatMessage('rule.illegality') },
      ],
      properties: {
        placeholder: formatMessage('common.name'),
      },
    },
    {
      label: formatMessage('uns.description'),
      name: 'description',
      type: 'TextArea',
      properties: {
        placeholder: formatMessage('uns.description'),
      },
    },
    {
      label: formatMessage('alert.acceptType'),
      name: 'withFlags',
      type: 'Select',
      rules: [{ required: true, message: formatMessage('rule.required') }],
      properties: {
        options: [
          { label: formatMessage('alert.person'), value: 16 },
          // { label: formatMessage('alert.workflow'), value: 32 },
        ],
        placeholder: formatMessage('alert.acceptType'),
        // onChange: (value: number) => {
        // form.setFieldsValue({ accept: undefined });
        // if (value === 16) {
        //   setOptionsData(userData);
        // } else if (value === 32) {
        //   setOptionsData(processData);
        // }
        // },
        onClear: () => {
          form.setFieldsValue({ accept: undefined });
          // setOptionsData([]);
        },
      },
    },
    {
      label: formatMessage('alert.accept'),
      name: 'accept',
      dependencies: ['withFlags'],
      render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const acceptType = Form.useWatch('withFlags', form);
        if (acceptType !== 16) {
          return null;
        }
        return (
          <Form.Item
            name="accept"
            label={formatMessage('alert.accept')}
            rules={[{ required: true, message: formatMessage('rule.required') }]}
          >
            <Select
              // fieldNames={
              //   acceptType === 16
              //     ? { label: 'preferredUsername', value: 'id' }
              //     : { label: 'processDefinitionName', value: 'id' }
              // }
              placeholder={
                acceptType === 16
                  ? formatMessage('alert.person')
                  : acceptType === 32
                    ? formatMessage('alert.workflow')
                    : ''
              }
              options={userData.map((item: any) => {
                return {
                  label: item.preferredUsername,
                  value: item.id,
                };
              })}
              // mode={acceptType === 16 ? 'multiple' : undefined}
              mode={'multiple'}
              onChange={(_, option: any) => {
                const selected = Array.isArray(option)
                  ? option.map((o) => ({ value: o.value, label: o.label }))
                  : { value: option.value, label: option.label };

                form.setFieldsValue({ accept: selected });
              }}
              showSearch
            />
          </Form.Item>
        );
      },
    },
    {
      type: 'divider',
    },
    {
      render: () => <NameSpace isEdit={isEdit} />,
    },
    {
      render: Condition,
    },
    {
      render: DeadZone,
    },
    {
      label: formatMessage('alert.overDuration'),
      name: ['protocol', 'overTime'],
      type: 'Number',
      properties: {
        placeholder: formatMessage('alert.regularValue'),
      },
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
  const [show, setShow] = useState(false);
  const [form] = Form.useForm();
  const [buttonLoading, setButtonLoading] = useState(false);
  const { loading, pagination, data, refreshRequest, reload, setSearchParams } = usePagination({
    fetchApi: getAlertList,
    initPageSize: 23,
    defaultParams: {
      type: 5,
    },
  });
  useEffect(() => {
    data?.map((e: any) => {
      if (e.id === businessId) {
        onOpen({
          topic: e.topic,
        });
      }
    });
  }, [businessId, data]);
  useActivate(() => {
    refreshRequest?.();
  });
  const onAddHandle = () => {
    setIsEdit(false);
    form.resetFields();
    if (show) return;
    setShow(true);
  };

  const onClose = () => {
    setShow(false);
    setIsEdit(false);
    form.resetFields();
    // setOptionsData([]);
  };
  const onSave = async () => {
    const values = await form.validateFields();
    let addData: any;
    if (values.withFlags === 16) {
      addData = {
        ...values,
        userList: values.accept.map((e: any) => {
          return {
            id: e.value,
            preferredUsername: e.label,
          };
        }),
      };

      delete addData.accept;
    } else if (values.withFlags === 32) {
      addData = { ...values, extend: values.accept.value };
      delete addData.accept;
    }

    setButtonLoading(true);
    const api = isEdit ? editRule : addRule;
    await api({
      ...addData,
      expression: `a1${values?.protocol?.condition}${values?.protocol?.limitValue}`,
    })
      .then(() => {
        refreshRequest();
        onClose();
      })
      .finally(() => {
        setButtonLoading(false);
      });
  };
  const onDeleteHandle = (item: any) => {
    deleteRule({
      path: item.topic,
      withFlow: false,
      withDashboard: false,
    }).then(() => {
      reload();
    });
  };

  const { ModalDom, onOpen } = useInformationModal({
    onCallBack: refreshRequest,
  });
  return (
    <ComLayout loading={loading}>
      <ComContent
        title={title}
        extra={
          <Flex gap={8}>
            <ComSearch
              form={searchForm}
              formItemOptions={[
                {
                  name: 'k',
                  properties: {
                    prefix: <Search />,
                    placeholder: formatMessage('alert.search'),
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
          </Flex>
        }
        hasBack={false}
        style={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <ComCardList
          onAddHandle={onAddHandle}
          onDeleteHandle={onDeleteHandle}
          addAuth={ButtonPermission['alert.add']}
          deleteAuth={ButtonPermission['alert.delete']}
          list={data?.map((item: any) => ({
            ...item,
            icon: <Alarm color="#DA1E28" size="22" />,
          }))}
          style={{ gap: 20, flex: 1 }}
          cardStyle={{ width: 243, height: 200 }}
          viewOptions={[
            {
              label: formatMessage('alert.alterCount'),
              valueKey: 'noReadCount',
              render: (_, record) => {
                return (
                  <span>
                    {/* <span style={{ color: text > 0 ? '#DA1E28' : undefined }}>{text ?? 0}</span>/ */}
                    <span>{record?.alarmCount}</span>
                  </span>
                );
              },
            },
            {
              label: formatMessage('uns.description'),
              valueKey: 'description',
            },
          ]}
          operationOptions={[
            {
              label: formatMessage('alert.edit'),
              onClick: (item) => {
                setIsEdit(true);
                setShow(true);
                form.setFieldsValue({
                  id: item.id,
                  refers: [
                    {
                      topic: item.refTopic,
                      field: item.field,
                    },
                  ],
                  dataPath: item.name,
                  description: item.description,
                  protocol: item.alarmRuleDefine,
                  withFlags: item.withFlags,
                  accept:
                    item.withFlags === 32
                      ? { value: item.processDefinition.id, label: item.processDefinition.id.processDefinitionName }
                      : item.handlerList.map((item: any) => {
                          return {
                            value: item.userId,
                            label: item.username,
                          };
                        }),
                });
              },
              type: 'block',
              auth: ButtonPermission['alert.edit'],
            },
            {
              label: formatMessage('alert.show'),
              onClick: (item) => {
                onOpen({
                  topic: item.topic,
                });
              },
              type: 'block',
              // auth: ButtonPermission['alert.show'],
            },
          ]}
        />
        <ComPaginationNav {...pagination} />
        {ModalDom}
      </ComContent>
      <ComDrawer title=" " width={680} open={show} onClose={onClose}>
        {show && (
          <OperationForm
            formConfig={{
              labelCol: { span: 7 },
              wrapperCol: { span: 17 },
            }}
            title={isEdit ? formatMessage('alert.editAlert') : formatMessage('alert.createAlert')}
            form={form}
            onCancel={onClose}
            onSave={onSave}
            formItemOptions={formItemOptions}
            loading={buttonLoading}
          />
        )}
      </ComDrawer>
    </ComLayout>
  );
};

export default Alert;
