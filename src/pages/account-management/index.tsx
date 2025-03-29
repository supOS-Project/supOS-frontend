import { Flex, message, App, Typography } from 'antd';
import { useTranslate, usePagination } from '@/hooks';
import { Add, Delete, Edit, Password, UserIdentification } from '@carbon/icons-react';
import { Tag } from '@carbon/react';
import { ComTable, AuthButton, ComLayout, ComContent } from '@/components';
import { deleteUser, getUserManageList, updateUser } from '@/apis/inter-api/user-manage';
import useResetPassword from '@/pages/account-management/components/useResetPassword';
import useAddUser from '@/pages/account-management/components/useAddUser';
import { FC } from 'react';
import { PageProps } from '@/common-types.ts';
import { ButtonPermission } from '@/common-types/button-permission';
import useRoleSetting from '@/pages/account-management/components/useRoleSetting';
import { useThemeContext } from '@/contexts/theme-context';
const { Text } = Typography;

const apiObj: any = {
  updateUser,
};

const AccountManagement: FC<PageProps> = ({ title }) => {
  const formatMessage = useTranslate();
  const themeStore = useThemeContext();

  const buttonBg = themeStore.theme.includes('dark') ? '#393939' : '#c6c6c6';
  const { modal } = App.useApp();

  const { data, pagination, setLoading, loading, refreshRequest } = usePagination({
    initPageSize: 100,
    fetchApi: getUserManageList,
    simple: false,
  });

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
  const { onRoleModalOpen, RoleModal } = useRoleSetting();
  const onAddHandle = () => {
    onAddOpen();
  };
  return (
    <ComLayout loading={loading}>
      <ComContent
        hasBack={false}
        title={title}
        extra={
          <>
            <AuthButton
              auth={ButtonPermission['accountManagement.add']}
              style={{ height: 28 }}
              onClick={onAddHandle}
              type="primary"
            >
              <Flex align="center" gap={6}>
                {formatMessage('account.add')}
                <Add size={16} />
              </Flex>
            </AuthButton>
            <AuthButton
              auth={ButtonPermission['accountManagement.roleSettings']}
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
          '--cds-layer': 'var(--supos-header-bg-color)',
          padding: 40,
        }}
      >
        <ComTable
          style={{ height: '100%' }}
          scroll={{ y: 'calc(100%  - 32px)' }}
          data={data}
          columns={[
            {
              dataIndex: 'preferredUsername',
              title: formatMessage('account.account'),
              render: (text) => {
                return (
                  <Text style={{ maxWidth: 400 }} ellipsis title={text}>
                    {text}
                  </Text>
                );
              },
            },
            {
              dataIndex: 'firstName',
              title: formatMessage('account.name'),
              render: (text) => {
                return (
                  <Text style={{ maxWidth: 400 }} ellipsis title={text}>
                    {text}
                  </Text>
                );
              },
            },
            {
              dataIndex: 'email',
              title: formatMessage('account.email'),
            },
            {
              dataIndex: 'roleList',
              title: formatMessage('account.role'),
              render: (text) => {
                return <div style={{ width: 'max-content' }}>{text?.map((i: any) => i.roleName)?.join(',')}</div>;
              },
            },
            {
              dataIndex: 'enabled',
              title: formatMessage('common.status'),
              render: (text) => {
                return text ? (
                  <Tag size="sm" type={'green'}>
                    {formatMessage('account.available')}
                  </Tag>
                ) : (
                  <Tag size="sm" type={'magenta'}>
                    {formatMessage('account.unavailable')}
                  </Tag>
                );
              },
            },
            {
              dataIndex: 'edit',
              title: formatMessage('common.operation'),
              render: (_, record: any) => {
                return (
                  <Flex>
                    {record?.enabled ? (
                      <AuthButton
                        color="danger"
                        variant="text"
                        auth={ButtonPermission['accountManagement.disable']}
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
                        auth={ButtonPermission['accountManagement.enable']}
                        style={{ height: 18, fontSize: 12 }}
                        color="primary"
                        variant="link"
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
          ]}
          pagination={pagination}
          operationOptions={{
            title: formatMessage('common.edit'),
            render(record: any) {
              return (
                <Flex gap={16} style={{ fontSize: 12 }}>
                  <AuthButton
                    auth={ButtonPermission['accountManagement.edit']}
                    style={{ height: 18, fontSize: 12, backgroundColor: buttonBg }}
                    color="default"
                    variant="filled"
                    onClick={() => {
                      onAddOpen?.(record);
                    }}
                  >
                    {formatMessage('common.edit')}
                    <Edit size={14} />
                  </AuthButton>
                  <AuthButton
                    auth={ButtonPermission['accountManagement.resetPassword']}
                    style={{ height: 18, fontSize: 12, backgroundColor: buttonBg }}
                    color="default"
                    variant="filled"
                    onClick={() => {
                      onOpen?.(record);
                    }}
                  >
                    {formatMessage('account.resetpassword')}
                    <Password size={14} />
                  </AuthButton>
                  {record.preferredUsername !== 'supos' ? (
                    <AuthButton
                      auth={ButtonPermission['accountManagement.delete']}
                      style={{ height: 18, fontSize: 12 }}
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
                          okText: formatMessage('appSpace.confirm'),
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
