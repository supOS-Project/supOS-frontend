import { FC, ReactNode, useState } from 'react';
import { Popover, Divider, Flex, PopoverProps, Button, Form, Input } from 'antd';
import { ColorPalette, Logout, SettingsEdit, UserAvatar } from '@carbon/icons-react';
import { removeToken, validSpecialCharacter, storageOpt } from '@/utils';
import { useTranslate } from '@/hooks';
import { observer } from 'mobx-react-lite';
import { useRoutesContext } from '@/contexts/routes-context.ts';
import ComSelect from '../com-select';
import { ThemeTypeEnum } from '@/stores/theme-store.ts';
import { useThemeContext } from '@/contexts/theme-context.ts';
import ProModal from '../pro-modal';
import { updateUser, userResetPwd } from '@/apis/inter-api/user-manage';
import { LOGIN_URL } from '@/common-types/constans';
import { SUPOS_USER_GUIDE_ROUTES, SUPOS_USER_TIPS_ENABLE } from '@/common-types/constans';

const logout = (path?: string) => {
  removeToken();
  location.href = path || LOGIN_URL;
  // 退出时删除guide routes信息
  storageOpt.remove(SUPOS_USER_GUIDE_ROUTES);
  // 退出时重置tips信息
  storageOpt.remove(SUPOS_USER_TIPS_ENABLE);
};

const ComList: FC<{
  list: { icon?: ReactNode; label?: ReactNode; children?: ReactNode; key: string; onClick?: () => void }[];
}> = ({ list }) => {
  return (
    <>
      {list?.map((item) => {
        return (
          <Flex
            key={item.key}
            justify="space-between"
            align="center"
            style={{ width: '100%', padding: '6px 8px', cursor: 'pointer' }}
            onClick={item?.onClick}
          >
            <Flex justify="flex-start" align="center" gap={8} style={{ flex: 1 }}>
              {item.icon}
              {item.label}
            </Flex>
            {item.children && <div>{item.children}</div>}
          </Flex>
        );
      })}
    </>
  );
};

const UserPopover: FC<PopoverProps> = ({ children, ...restProps }) => {
  const formatMessage = useTranslate();
  const routesStore = useRoutesContext();
  const themeStore = useThemeContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const toggleTheme = (v: string) => {
    themeStore.setTheme(v as ThemeTypeEnum);
  };
  const name = routesStore.currentUserInfo.firstName || routesStore.currentUserInfo.preferredUsername;
  const version = `${routesStore.systemInfo.appTitle} Version : ${routesStore.systemInfo?.version || '1.0.0'}`;
  const userContent = (
    <div className="userPopoverWrap">
      <div className="userAvatar">{name?.slice(0, 1)?.toLocaleUpperCase()}</div>
      <div className="userName">{name}</div>
      <Flex
        title={routesStore.currentUserInfo.roleString}
        className="userRole"
        justify="center"
        align="center"
        gap={2}
        style={{ width: '100%' }}
      >
        <UserAvatar size={12} style={{ flexShrink: 0 }} />
        <div
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {routesStore.currentUserInfo.roleString}
        </div>
      </Flex>
      {routesStore.currentUserInfo.email && (
        <div className="userEmail" title={routesStore.currentUserInfo.email}>
          <div
            className="emailStatus"
            style={{ backgroundColor: routesStore.currentUserInfo.emailVerified ? '#6fdc8c' : '#ff8389' }}
          />
          {routesStore.currentUserInfo.email}
        </div>
      )}
      <Divider
        style={{
          background: '#c6c6c6',
          margin: '15px auto',
        }}
      />
      <ComList
        list={[
          {
            icon: <ColorPalette color="var(--supos-text-color)" size={18} />,
            label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.theme')}</div>,
            key: 'theme',
            children: (
              <ComSelect
                value={themeStore._theme}
                style={{ height: 28, width: 94, backgroundColor: 'var(--supos-bg-color) !important' }}
                onChange={toggleTheme}
                options={[
                  {
                    label: formatMessage('common.light'),
                    value: ThemeTypeEnum.LightBlue,
                  },
                  {
                    label: formatMessage('common.dark'),
                    value: ThemeTypeEnum.DarkBlue,
                  },
                  {
                    label: formatMessage('common.lightChartreuse'),
                    value: ThemeTypeEnum.LightChartreuse,
                  },
                  {
                    label: formatMessage('common.darkChartreuse'),
                    value: ThemeTypeEnum.DarkChartreuse,
                  },
                  {
                    label: formatMessage('common.followSystem'),
                    value: ThemeTypeEnum.System,
                  },
                ]}
              />
            ),
          },
          // {
          //   icon: <Time color="var(--supos-text-color)" size={18} />,
          //   label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.timezone')}</div>,
          //   key: 'timeZone',
          //   children: (
          //     <ComSelect
          //       value="UTC+8"
          //       style={{ height: 28, width: 94, backgroundColor: 'var(--supos-bg-color) !important' }}
          //       options={[
          //         {
          //           label: 'UTC+8',
          //           value: 'UTC+8',
          //         },
          //       ]}
          //     />
          //   ),
          // },
        ]}
      />
      <Divider
        style={{
          background: '#c6c6c6',
          margin: '15px auto',
        }}
      />
      <ComList
        list={[
          // {
          //   icon: (
          //     <Badge count={100} size={'small'} styles={{ indicator: { fontSize: 10, padding: '0 2px' } }}>
          //       <Alarm color="var(--supos-text-color)" size={18} />
          //     </Badge>
          //   ),
          //   label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.information')}</div>,
          //   key: 'information',
          //   onClick: () => {
          //     setInformationOpen(true);
          //   },
          // },
          {
            icon: <SettingsEdit color="var(--supos-text-color)" size={18} />,
            label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.settings')}</div>,
            key: 'setting',
            onClick: () => {
              setOpen(true);
              form1.setFieldValue('firstName', routesStore?.currentUserInfo?.firstName);
            },
          },
          {
            icon: <Logout color="var(--supos-text-color)" size={18} />,
            label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.logout')}</div>,
            key: 'layout',
            onClick: () => logout(routesStore.systemInfo.loginPath),
          },
        ]}
      />
      <span style={{ marginTop: 10 }} className="userEmail" title={version}>
        {version}
      </span>
    </div>
  );
  const onSave1 = async () => {
    const info = await form1.validateFields();
    setLoading(true);
    updateUser({
      ...info,
      userId: routesStore.currentUserInfo?.sub,
      roleList: routesStore.currentUserInfo?.roleList,
    })
      .then(() => {
        // 修改用户名，手动去更新
        routesStore.updateFirstNameForUserInfo(info.firstName);
        setOpen(false);
        form1.resetFields();
        form2.resetFields();
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onSave2 = async () => {
    const info = await form2.validateFields();
    setLoading(true);
    userResetPwd({
      newPassword: info.password,
      password: info.oldPassword,
      userId: routesStore.currentUserInfo?.sub,
      username: routesStore.currentUserInfo?.preferredUsername,
    })
      .then(() => {
        logout(routesStore.systemInfo.loginPath);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
      <Popover rootClassName="userPopover" placement="bottomRight" {...restProps} content={userContent}>
        {children}
      </Popover>
      <ProModal
        size="xxs"
        onCancel={() => {
          setOpen(false);
          form1.resetFields();
          form2.resetFields();
        }}
        title={formatMessage('account.settings')}
        open={open}
        maskClosable={false}
      >
        <Form layout="vertical" form={form1}>
          <Form.Item
            label={formatMessage('account.updateDisplayName')}
            name="firstName"
            rules={[
              {
                required: true,
                message: formatMessage('rule.required'),
              },
              {
                type: 'string',
                min: 1,
                max: 200,
                message: formatMessage('rule.characterLimit'),
              },
              {
                pattern: validSpecialCharacter,
                message: formatMessage('rule.illegality'),
              },
            ]}
          >
            <Input className={'input'} />
          </Form.Item>
          <Button onClick={onSave1} style={{ height: 32 }} block type="primary" loading={loading}>
            {formatMessage('common.save')}
          </Button>
        </Form>
        <Divider
          style={{
            background: '#c6c6c6',
            margin: '15px auto',
          }}
        />
        <Form layout="vertical" form={form2}>
          <Form.Item
            label={formatMessage('account.oldPassWord')}
            name="oldPassword"
            rules={[
              {
                required: true,
                message: '',
              },
            ]}
          >
            <Input.Password placeholder={formatMessage('appGui.password')} />
          </Form.Item>
          <Form.Item
            label={formatMessage('account.newpassWord')}
            name="password"
            dependencies={['oldPassword']}
            rules={[
              {
                required: true,
                message: '',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('oldPassword') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(formatMessage('account.passwordSame')));
                },
              }),
            ]}
          >
            <Input.Password placeholder={formatMessage('appGui.password')} />
          </Form.Item>
          <Form.Item
            label={formatMessage('account.confirmpassWord')}
            name="confirm_password"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: '',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(formatMessage('account.passwordMatch')));
                },
              }),
            ]}
          >
            <Input.Password placeholder={formatMessage('appGui.password')} />
          </Form.Item>
          <Button onClick={onSave2} style={{ height: 32 }} block type="primary" loading={loading}>
            {formatMessage('common.save')}
          </Button>
        </Form>
      </ProModal>
    </>
  );
};

export default observer(UserPopover);
