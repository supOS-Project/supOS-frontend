import { FC, ReactNode, useEffect, useState } from 'react';
import { Popover, Divider, Flex, PopoverProps, Button, Form, Input, App, ConfigProvider, Tabs } from 'antd';
import { Calendar, Checkmark, ColorPalette, Contrast, Logout, SettingsEdit, UserAvatar } from '@carbon/icons-react';
import { useTranslate } from '@/hooks';
import ComSelect from '../com-select';
import ProModal from '../pro-modal';
import { setHomePageApi, updateUser, userResetPwd } from '@/apis/inter-api/user-manage';
import { LOGIN_URL, OMC_MODEL } from '@/common-types/constans';
import { SUPOS_USER_GUIDE_ROUTES, SUPOS_USER_TIPS_ENABLE } from '@/common-types/constans';
import { RoutesProps } from '@/stores/types.ts';
import { removeToken } from '@/utils/auth';
import { storageOpt } from '@/utils/storage';
import { passwordRegex, phoneRegex, validSpecialCharacter } from '@/utils/pattern';
import { fetchBaseStore, updateForUserInfo, useBaseStore } from '@/stores/base';
import { PrimaryColorType, setPrimaryColor, setTheme, ThemeType, useThemeStore } from '@/stores/theme-store.ts';
import Cookies from 'js-cookie';
import { logoutApi } from '@/apis/inter-api';
import { queryDeadline } from '@/apis/inter-api/license';
// import { initI18n, useI18nStore } from '@/stores/i18n-store.ts';
// import { getPluginListApi } from '@/apis/inter-api/plugin.ts';
// import { preloadPluginLang } from '@/utils';

const logout = (path?: string) => {
  logoutApi().then(() => {
    removeToken();
    Cookies.remove(OMC_MODEL, { path: '/' });
    // 退出时删除guide routes信息
    storageOpt.remove(SUPOS_USER_GUIDE_ROUTES);
    // 退出时重置tips信息
    storageOpt.remove(SUPOS_USER_TIPS_ENABLE);
    // 清空
    storageOpt.remove('personInfo');
    location.href = path || LOGIN_URL;
  });
};

const ComList: FC<{
  list: {
    icon?: ReactNode;
    label?: ReactNode;
    children?: ReactNode;
    key: string;
    onClick?: () => void;
    disabled?: boolean;
  }[];
}> = ({ list }) => {
  return (
    <>
      {list?.map((item) => {
        return (
          <Flex
            key={item.key}
            justify="space-between"
            align="center"
            style={{
              width: '100%',
              padding: '6px 8px',
              cursor: item?.disabled ? 'not-allowed' : 'pointer',
              opacity: item?.disabled ? 0.5 : undefined,
            }}
            onClick={!item?.disabled ? item?.onClick : undefined}
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
const colorList = [
  {
    code: 'blue',
    // name: i18n('setting.label.blue'),
    color: '#1d77fe',
  },
  {
    code: 'chartreuse',
    // name: i18n('setting.label.violet'),
    color: '#94c618',
  },
];
const UserPopover: FC<PopoverProps> = ({ children, ...restProps }) => {
  const formatMessage = useTranslate();
  const { currentUserInfo, systemInfo, pickedRoutesOptionsNoChildrenMenu, pluginList } = useBaseStore((state) => ({
    currentUserInfo: state.currentUserInfo,
    systemInfo: state.systemInfo,
    pickedRoutesOptionsNoChildrenMenu: state.pickedRoutesOptionsNoChildrenMenu,
    pluginList: state.pluginList,
  }));
  const { _theme, primaryColor } = useThemeStore((state) => ({
    _theme: state._theme,
    primaryColor: state.primaryColor,
  }));
  // const { lang } = useI18nStore((state) => ({
  //   lang: state.lang,
  // }));
  const [expirationDate, setExpirationDate] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const { message } = App.useApp();

  const toggleTheme = (v: string) => {
    setTheme(v as ThemeType);
  };
  const togglePrimaryColor = (v: string) => {
    setPrimaryColor(v as PrimaryColorType);
  };
  const name = currentUserInfo.firstName || currentUserInfo.preferredUsername;
  const version = `${systemInfo.appTitle} Version : ${systemInfo?.version || '1.0.0'}`;
  const userContent = (
    <div className="userPopoverWrap">
      <div className="userAvatar">{name?.slice(0, 1)?.toLocaleUpperCase()}</div>
      <div className="userName">{name}</div>
      <Flex
        title={currentUserInfo.roleString}
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
          {currentUserInfo.roleString}
        </div>
      </Flex>
      {currentUserInfo.email && (
        <div className="userEmail" title={currentUserInfo.email}>
          <div
            className="emailStatus"
            style={{ backgroundColor: currentUserInfo.emailVerified ? '#6fdc8c' : '#ff8389' }}
          />
          {currentUserInfo.email}
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
            icon: <Contrast color="var(--supos-text-color)" size={18} />,
            label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.theme')}</div>,
            key: 'theme',
            children: (
              <ComSelect
                value={_theme}
                style={{ height: 28, width: 94, backgroundColor: 'var(--supos-bg-color) !important' }}
                onChange={toggleTheme}
                options={[
                  {
                    label: formatMessage('common.light'),
                    value: ThemeType.Light,
                  },
                  {
                    label: formatMessage('common.dark'),
                    value: ThemeType.Dark,
                  },
                  {
                    label: formatMessage('common.followSystem'),
                    value: ThemeType.System,
                  },
                ]}
              />
            ),
          },
          {
            icon: <ColorPalette color="var(--supos-text-color)" size={18} />,
            label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.themeColor')}</div>,
            key: 'themeColor',
            children: (
              <ul style={{ display: 'flex', gap: 12, width: 94 }}>
                {colorList.map((item) => {
                  return (
                    <div key={item.code}>
                      <div
                        onClick={togglePrimaryColor.bind(null, item.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          backgroundColor: item.color,
                          height: 25,
                          width: 25,
                          borderRadius: '50%',
                        }}
                      >
                        {primaryColor == item.code && <Checkmark style={{ color: '#fff' }} />}
                      </div>
                    </div>
                  );
                })}
              </ul>
            ),
          },
          // {
          //   icon: <Earth color="var(--supos-text-color)" size={18} />,
          //   label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.language')}</div>,
          //   key: 'language',
          //   children: (
          //     <ComSelect
          //       onChange={(v) => {
          //         getPluginListApi().then(async (data) => {
          //           const pluginLang = await preloadPluginLang(
          //             data
          //               ?.filter((f: any) => f.installStatus === 'installed')
          //               ?.filter((f: any) => f?.plugInfoYml?.route?.name)
          //               ?.map((m: any) => ({ name: `/${m?.plugInfoYml?.route?.name}` })) || [],
          //             v
          //           );
          //           return initI18n(v, pluginLang);
          //         });
          //       }}
          //       value={lang}
          //       style={{ height: 28, width: 94, backgroundColor: 'var(--supos-bg-color) !important' }}
          //       options={[
          //         {
          //           label: 'English',
          //           value: 'en-US',
          //         },
          //         {
          //           label: '中文',
          //           value: 'zh-CN',
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
              form1.setFieldValue('firstName', currentUserInfo?.firstName);
              form1.setFieldValue('phone', currentUserInfo?.phone);
              form1.setFieldValue('email', currentUserInfo?.email);
            },
            // 免登环境未登录的用户禁用设置
            disabled: systemInfo?.ldapEnable || currentUserInfo?.sub === 'guest',
          },
          {
            icon: <Logout color="var(--supos-text-color)" size={18} />,
            label: <div style={{ color: 'var(--supos-text-color)' }}>{formatMessage('common.logout')}</div>,
            key: 'layout',
            onClick: () => logout(systemInfo.loginPath),
          },
        ]}
      />
      {name === 'supos' && expirationDate && (
        <>
          <Divider
            style={{
              background: '#c6c6c6',
              margin: '15px auto',
            }}
          />
          <ComList
            list={[
              {
                icon: <Calendar color="var(--supos-text-color)" size={18} />,
                label: (
                  <div style={{ color: 'var(--supos-text-color)' }}>
                    {formatMessage('common.expirationDate')}：{expirationDate}
                  </div>
                ),
                key: 'layout',
                disabled: true,
              },
            ]}
          />
        </>
      )}
      <span style={{ marginTop: 10 }} className="userEmail" title={version}>
        {version}
      </span>
    </div>
  );
  const rest = () => {
    form1.resetFields();
    form2.resetFields();
  };
  const onSave1 = async () => {
    const info = await form1.validateFields();
    setLoading(true);
    updateUser({
      ...info,
      userId: currentUserInfo?.sub,
      // roleList: routesStore.currentUserInfo?.roleList,
    })
      .then(() => {
        message.success(formatMessage('common.settingSuccess'));
        // 修改用户名，手动去更新
        updateForUserInfo({
          ...info,
        });
        setOpen(false);
        form1.resetFields();
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
      userId: currentUserInfo?.sub,
      username: currentUserInfo?.preferredUsername,
    })
      .then(() => {
        message.success(formatMessage('common.settingSuccess'));
        logout(systemInfo.loginPath);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onSave3 = async () => {
    const info = await form3.validateFields();
    if (info) {
      const option = pickedRoutesOptionsNoChildrenMenu?.find((f) => f.value === info.homePage);
      const getHomePage = (item?: RoutesProps) => {
        if (!item) return '';
        if (item.isFrontend) return item.menu!.url;
        if (item.indexUrl) return item.indexUrl;
        return `/${item.key}`;
      };
      const homePage = getHomePage(option);
      setHomePageApi({ homePage })?.then(() => {
        updateForUserInfo({ homePage });
        message.success(formatMessage('common.settingSuccess'));
      });
    }
  };

  useEffect(() => {
    if (name !== 'supos') return;
    if (pluginList?.filter((f: any) => f.installStatus === 'installed')?.find((f: any) => f?.name === 'license')) {
      queryDeadline().then((data) => {
        setExpirationDate(data);
      });
    }
  }, [name, pluginList]);

  useEffect(() => {
    if (open) {
      // 更新路由
      fetchBaseStore?.().then(() => {
        const info = pickedRoutesOptionsNoChildrenMenu?.find(
          (f) =>
            '/' + f.value === currentUserInfo?.homePage ||
            f.menu?.url === currentUserInfo?.homePage ||
            f.indexUrl === currentUserInfo?.homePage
        );
        form3.setFieldValue('homePage', info?.value);
      });
    }
  }, [open]);

  const items: any[] = [
    {
      label: formatMessage('account.profile'),
      key: 1,
      children: (
        <Flex style={{ height: 300 }} vertical>
          <Form layout="vertical" form={form1} style={{ flex: 1 }}>
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
              <Input className={'input'} placeholder={formatMessage('account.displayName')} />
            </Form.Item>
            <Form.Item
              label={formatMessage('common.update') + formatMessage('account.email')}
              name="email"
              rules={[{ type: 'email' }]}
            >
              <Input placeholder={formatMessage('account.email')} />
            </Form.Item>
            <Form.Item
              label={formatMessage('common.update') + formatMessage('account.phone')}
              name="phone"
              rules={[{ pattern: phoneRegex, message: formatMessage('rule.phone') }]}
              validateTrigger={['onBlur']}
            >
              <Input
                placeholder={formatMessage('account.phone')}
                onFocus={() => {
                  form1.setFields([
                    {
                      name: 'phone',
                      errors: undefined, // 清除校验错误
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Form>
          <Button onClick={onSave1} style={{ height: 32 }} block type="primary" loading={loading}>
            {formatMessage('common.save')}
          </Button>
        </Flex>
      ),
    },
    {
      label: formatMessage('common.password'),
      key: 2,
      children: (
        <Flex style={{ height: 300 }} vertical>
          <Form layout="vertical" form={form2} style={{ flex: 1 }}>
            <Form.Item
              label={formatMessage('account.oldPassWord')}
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: '',
                },
                {
                  max: 10,
                  message: formatMessage('uns.labelMaxLength', {
                    label: formatMessage('appGui.password'),
                    length: 10,
                  }),
                },
                { pattern: passwordRegex, message: formatMessage('rule.password') },
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
                {
                  max: 10,
                  message: formatMessage('uns.labelMaxLength', {
                    label: formatMessage('appGui.password'),
                    length: 10,
                  }),
                },
                { pattern: passwordRegex, message: formatMessage('rule.password') },
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
                {
                  max: 10,
                  message: formatMessage('uns.labelMaxLength', {
                    label: formatMessage('appGui.password'),
                    length: 10,
                  }),
                },
                { pattern: passwordRegex, message: formatMessage('rule.password') },
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
          </Form>
          <Button onClick={onSave2} style={{ height: 32 }} block type="primary" loading={loading}>
            {formatMessage('common.save')}
          </Button>
        </Flex>
      ),
    },
    {
      label: formatMessage('account.homePage'),
      key: 3,
      children: (
        <Form
          layout="vertical"
          form={form3}
          style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Form.Item label={formatMessage('account.homePage')} name="homePage">
            <ComSelect
              options={pickedRoutesOptionsNoChildrenMenu}
              placeholder={formatMessage('common.searchPage')}
              filterOption={(input, option) =>
                ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
              showSearch
            />
          </Form.Item>
          <Form.Item shouldUpdate={(pre, cur) => pre.homePage !== cur.homePage} noStyle>
            {({ getFieldValue }) => {
              return (
                <Button
                  disabled={!getFieldValue('homePage')}
                  onClick={onSave3}
                  style={{ height: 32 }}
                  block
                  type="primary"
                  loading={loading}
                >
                  {formatMessage('common.save')}
                </Button>
              );
            }}
          </Form.Item>
        </Form>
      ),
    },
  ];
  return (
    <>
      <Popover rootClassName="userPopover" placement="bottomRight" {...restProps} content={userContent}>
        {children}
      </Popover>
      <ProModal
        size="sm"
        onCancel={() => {
          setOpen(false);
          rest();
        }}
        title={formatMessage('account.settings')}
        open={open}
        // open
        maskClosable={false}
      >
        <ConfigProvider
          theme={{
            components: {
              Form: {
                itemMarginBottom: 12,
              },
            },
          }}
        >
          <Tabs tabPosition="left" items={items} />

          {/*<Divider*/}
          {/*  style={{*/}
          {/*    background: '#c6c6c6',*/}
          {/*    margin: '16px auto',*/}
          {/*  }}*/}
          {/*/>*/}

          {/*<Divider*/}
          {/*  style={{*/}
          {/*    background: '#c6c6c6',*/}
          {/*    margin: '16px auto',*/}
          {/*  }}*/}
          {/*/>*/}
        </ConfigProvider>
      </ProModal>
    </>
  );
};

export default UserPopover;
