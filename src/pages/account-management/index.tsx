import { Flex, message, App, Tag } from 'antd';
import { useTranslate, usePagination, useMediaSize } from '@/hooks';
import { Add, Delete, Edit, Password, UserIdentification } from '@carbon/icons-react';
import { deleteUser, getUserManageList, updateUser } from '@/apis/inter-api/user-manage';
import useResetPassword from '@/pages/account-management/components/useResetPassword';
import useAddUser from '@/pages/account-management/components/useAddUser';
import { FC } from 'react';
import { PageProps } from '@/common-types.ts';
import { ButtonPermission } from '@/common-types/button-permission';
import useRoleSetting from './components/useRoleSetting';
import type { PaginationProps } from 'antd';
import { AuthButton } from '@/components/auth';
import ComLayout from '@/components/com-layout';
import ComContent from '@/components/com-layout/ComContent';
import ProTable from '@/components/pro-table';
import { useThemeStore } from '@/stores/theme-store.ts';
import { useBaseStore } from '@/stores/base';

const apiObj: any = {
  updateUser,
};

const AccountManagement: FC<PageProps> = ({ title }) => {
  const formatMessage = useTranslate();
  const ldapEnable = useBaseStore((state) => state?.systemInfo?.ldapEnable);
  const theme = useThemeStore((state) => state.theme);

  const buttonBg = theme.includes('dark') ? '#393939' : '#c6c6c6';
  const { modal } = App.useApp();
  const { isH5 } = useMediaSize();
  const { data, pagination, setLoading, loading, refreshRequest } = usePagination({
    initPageSize: 100,
    fetchApi: getUserManageList,
  });
  const showTotal: PaginationProps['showTotal'] = (total) =>
    isH5 ? null : `${formatMessage('common.total')}  ${total}  ${formatMessage('common.items')}`;
  const handle = (params: any, apiKey: string) => {
    setLoading(true);
    apiObj?.[apiKey]?.(params)
      .then(() => {
        message.success(formatMessage('common.optsuccess'));
      })
      .finally(() => {
        refreshRequest();
        setLoading(false);
      });
  };

  const { ModalDom, onOpen } = useResetPassword({
    onSaveBack: refreshRequest,
  });
  const { ModalAddDom, onAddOpen } = useAddUser({
    onSaveBack: refreshRequest,
  });
  const { onRoleModalOpen, RoleModal } = useRoleSetting({
    onSaveBack: refreshRequest,
  });
  const onAddHandle = () => {
    onAddOpen();
  };

  const columns: any = [
    {
      dataIndex: 'preferredUsername',
      ellipsis: true,
      titleIntlId: 'account.account',
      width: '10%',
    },
    {
      width: '10%',
      dataIndex: 'firstName',
      ellipsis: true,
      titleIntlId: 'common.name',
    },
    {
      width: '10%',
      dataIndex: 'phone',
      ellipsis: true,
      titleIntlId: 'account.phone',
    },
    {
      width: '10%',
      dataIndex: 'email',
      ellipsis: true,
      titleIntlId: 'account.email',
    },
    {
      width: '10%',
      dataIndex: 'roleList',
      ellipsis: true,
      titleIntlId: 'account.role',
      render: (text: any) => {
        return text?.map((i: any) => i.roleName)?.join(',');
      },
    },
    {
      width: '10%',
      dataIndex: 'enabled',
      ellipsis: true,
      titleIntlId: 'common.status',
      render: (text: any) => {
        return text ? (
          <Tag bordered={false} style={{ borderRadius: 15 }} color={'green'}>
            {formatMessage('account.available')}
          </Tag>
        ) : (
          <Tag bordered={false} style={{ borderRadius: 15 }} color={'magenta'}>
            {formatMessage('account.unavailable')}
          </Tag>
        );
      },
    },
    {
      dataIndex: 'edit',
      width: '15%',
      ellipsis: true,
      titleIntlId: 'common.operation',
      render: (_: any, record: any) => {
        return (
          <Flex>
            {record?.enabled ? (
              <AuthButton
                color="danger"
                variant="text"
                disabled={ldapEnable || record?.source === 'external'}
                auth={ButtonPermission['UserManagement.disable']}
                style={{ height: 18, fontSize: 12, textDecoration: 'underline', textUnderlineOffset: 4 }}
                onClick={() => {
                  handle(
                    {
                      userId: record.id,
                      enabled: false,
                      roleList: record.roleList,
                    },
                    'updateUser'
                  );
                }}
              >
                {formatMessage('account.disable')}
              </AuthButton>
            ) : (
              <AuthButton
                auth={ButtonPermission['UserManagement.enable']}
                style={{ height: 18, fontSize: 12 }}
                color="primary"
                variant="link"
                disabled={ldapEnable || record?.source === 'external'}
                onClick={() => {
                  handle(
                    {
                      userId: record.id,
                      enabled: true,
                      roleList: record.roleList,
                    },
                    'updateUser'
                  );
                }}
              >
                {formatMessage('account.enable')}
              </AuthButton>
            )}
          </Flex>
        );
      },
    },
    {
      titleIntlId: 'common.edit',
      dataIndex: 'Operation',
      width: '15%',
      minWidth: 350,
      ellipsis: true,
      render(_: any, record: any) {
        return (
          <Flex gap={16} style={{ fontSize: 12 }}>
            <AuthButton
              auth={ButtonPermission['UserManagement.edit']}
              style={{
                height: 18,
                fontSize: 12,
                backgroundColor: buttonBg,
              }}
              color="default"
              variant="filled"
              onClick={() => {
                onAddOpen?.(record);
              }}
              disabled={record?.source === 'external'}
            >
              {formatMessage('common.edit')}
              <Edit size={14} />
            </AuthButton>
            <AuthButton
              auth={ButtonPermission['UserManagement.resetPassword']}
              style={{
                height: 18,
                fontSize: 12,
                backgroundColor: buttonBg,
              }}
              color="default"
              variant="filled"
              onClick={() => {
                onOpen?.(record);
              }}
              disabled={ldapEnable && record?.preferredUsername !== 'supos'}
            >
              {formatMessage('account.resetpassword')}
              <Password size={14} />
            </AuthButton>
            {record?.preferredUsername !== 'supos' ? (
              <AuthButton
                auth={ButtonPermission['UserManagement.delete']}
                style={{
                  height: 18,
                  fontSize: 12,
                }}
                disabled={(ldapEnable && record?.preferredUsername !== 'supos') || record?.source === 'external'}
                color="default"
                variant="filled"
                onClick={() => {
                  modal.confirm({
                    title: formatMessage('common.deleteConfirm'),
                    onOk: () => {
                      setLoading(true);
                      deleteUser(record.id)
                        .then(() => {
                          message.success(formatMessage('common.optsuccess'));
                          refreshRequest();
                        })
                        .finally(() => {
                          setLoading(false);
                        });
                    },
                    cancelButtonProps: {
                      // style: { color: '#000' },
                    },
                    okText: formatMessage('common.confirm'),
                  });
                }}
              >
                {formatMessage('common.delete')}
                <Delete size={14} />
              </AuthButton>
            ) : null}
          </Flex>
        );
      },
    },
  ];
  return (
    <ComLayout loading={loading}>
      <ComContent
        hasBack={false}
        title={title}
        extra={
          <>
            <AuthButton
              auth={ButtonPermission['UserManagement.add']}
              style={{ height: 28 }}
              onClick={onAddHandle}
              type="primary"
              disabled={ldapEnable}
            >
              <Flex align="center" gap={6}>
                {formatMessage('account.newUsers')}
                <Add size={16} />
              </Flex>
            </AuthButton>
            <AuthButton
              auth={ButtonPermission['UserManagement.roleSettings']}
              style={{ height: 28, backgroundColor: buttonBg }}
              color="default"
              variant="filled"
              onClick={onRoleModalOpen}
            >
              <Flex align="center" gap={6}>
                {formatMessage('account.roleSettings')}
                <UserIdentification size={16} />
              </Flex>
            </AuthButton>
          </>
        }
        style={{
          padding: '20px 20px 0',
        }}
      >
        <ProTable
          resizeable
          style={{ height: '100%' }}
          scroll={{ y: 'calc(100vh  - 240px)', x: 'max-content' }}
          dataSource={data as any}
          columns={columns}
          pagination={{
            total: pagination?.total,
            showTotal: showTotal,
            style: { display: 'flex', justifyContent: 'flex-end', padding: '10px 0' },
            pageSize: pagination?.pageSize || 20,
            current: pagination?.page,
            showQuickJumper: true,
            pageSizeOptions: pagination?.pageSizes,
            onChange: pagination.onChange,
            onShowSizeChange: (current, size) => {
              pagination.onChange({ page: current, pageSize: size });
            },
          }}
        />
        {ModalDom}
        {ModalAddDom}
        {RoleModal}
      </ComContent>
    </ComLayout>
  );
};

export default AccountManagement;
