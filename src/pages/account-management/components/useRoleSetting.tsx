import { useTranslate } from '@/hooks';
import { useEffect, useRef, useState } from 'react';
import { App, Button, ConfigProvider, Divider, Flex, Form, Input, Popover, Tabs } from 'antd';
import styles from './RoleSetting.module.scss';
import { getRoleList } from '@/apis/inter-api/user-manage.ts';
import { Add, Close, UserAvatar } from '@carbon/icons-react';
import { produce } from 'immer';
import Permission from '@/pages/account-management/components/Permission.tsx';
import { getRoutes } from '@/apis/inter-api/kong.ts';
import { addRole, deleteRole, putRole } from '@/apis/inter-api/role.ts';
import { childrenRoutes } from '@/routers';
import { buttonLocal, ButtonPermission, getLatestCode } from '@/common-types/button-permission.ts';
import { getGroupedData, getTags } from '@/stores/utils.ts';
import { validSpecialCharacter } from '@/utils/pattern';
import Loading from '@/components/loading';
import ProModal from '@/components/pro-modal';
import { useI18nStore } from '@/stores/i18n-store.ts';

const AdminRoleId = '7ca9f922-0d35-44cf-8747-8dcfd5e66f8e';
const parentOrderMap = (routes: any) => {
  const info = routes?.find((f: any) => getTags(f?.service?.tags || [])?.root);
  return getTags(info?.service?.tags || []) || {};
};

const AddRoleContent = ({ successBack, disabled }: { successBack: (data: any) => void; disabled?: boolean }) => {
  const formatMessage = useTranslate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  const onSave = async () => {
    const info = await form.validateFields();
    setLoading(true);
    addRole({ name: info?.roleName })
      .then((data) => {
        setOpen(false);
        message.success(formatMessage('common.optsuccess'));
        successBack?.({ roleId: data?.roleId, roleName: info?.roleName });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <Popover
      open={open}
      onOpenChange={(open) => !open && setOpen(false)}
      styles={{
        body: {
          padding: '12px 0',
        },
      }}
      content={
        <div>
          <Flex justify="space-between" align="center" gap={8} style={{ padding: '0 12px' }}>
            <UserAvatar size={24} />
            <Form form={form}>
              <Form.Item
                name="roleName"
                style={{ padding: 0, margin: 0 }}
                rules={[
                  {
                    required: true,
                    message: formatMessage('rule.required'),
                  },
                  {
                    type: 'string',
                    min: 1,
                    max: 10,
                    message: formatMessage('rule.characterLimit'),
                  },
                  {
                    pattern: validSpecialCharacter,
                    message: formatMessage('uns.modelFormat'),
                  },
                ]}
              >
                <Input style={{ width: 140 }} size="small" placeholder={formatMessage('account.addRoleName')} />
              </Form.Item>
            </Form>
          </Flex>

          <Divider
            style={{
              background: 'var(--supos-t-dividr-color)',
              margin: '14px auto',
            }}
          />
          <Flex justify="space-between" align="center" style={{ padding: '0 12px' }}>
            <Button
              type="text"
              size="small"
              color="default"
              style={{ width: 50, color: 'var(--supos-t-text-disabled-color)' }}
              onClick={() => form.resetFields()}
            >
              {formatMessage('common.reset')}
            </Button>
            <Button loading={loading} type="primary" size="small" style={{ width: 60 }} onClick={onSave}>
              {formatMessage('common.save')}
            </Button>
          </Flex>
        </div>
      }
      arrow={false}
      placement={'bottom'}
      trigger={['click']}
    >
      <Button
        disabled={disabled}
        title={disabled ? formatMessage('account.addRoleMax') : formatMessage('account.addRole')}
        style={{ height: 26 }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        {formatMessage('account.addRole')}
        <Add size={16} />
      </Button>
    </Popover>
  );
};
export interface PermissionNode {
  id: string;
  name: string;
  menuNameKey?: string;
  type: string;
  checked: boolean;
  pagePermissionChecked?: boolean;
  actionPermissionChecked?: boolean;
  actionPermissionCheckedDisabled?: boolean;
  children?: PermissionNode[];
}

// 定义子组件暴露的 ref 类型
export interface PermissionRefProps {
  getValue: () => PermissionNode[];
  setValue: (value: PermissionNode[]) => void;
}

const useRoleSetting = ({ onSaveBack }: any) => {
  const formatMessage = useTranslate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const { message } = App.useApp();
  // 初始数据
  const initItems = useRef<any[]>([]);
  // 初始的菜单按钮配置
  const initialRolePermissionData = useRef<any[]>([]);
  // 所有button
  const allButtonData = useRef<any[]>([]);
  // 跟踪每个标签页的保存状态
  const unsavedChanges = useRef<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('');
  const permissionRefs = useRef<Map<string, PermissionRefProps | null>>(new Map());

  const { modal } = App.useApp();
  const onRoleModalOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    const hasChanges = [...unsavedChanges.current.values()].some(Boolean);
    if (hasChanges) {
      modal.confirm({
        title: formatMessage('common.unsavedChanges'),
        okText: formatMessage('common.save'),
        cancelText: formatMessage('common.unSave'),
        onOk: () => {
          onSave();
          setOpen(false);
        },
        onCancel: () => {
          setOpen(false);
        },
      });
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      Promise.all([getRoutes(), getRoleList()]).then((values) => {
        const [menu, role] = values;
        const _parentOrderMap = parentOrderMap(menu);
        initialRolePermissionData.current = mapInitialRolePermissionData(getGroupedData(menu, _parentOrderMap));
        allButtonData.current = extractButtonIds(initialRolePermissionData.current);
        const info =
          role?.map?.((i: any) => {
            const denyResourceButtonList = i.denyResourceList?.filter((f: any) => f.uri?.includes('button:'));
            const resourceButtonList = i?.resourceList?.some((i: any) => i.uri?.includes('button:'))
              ? (allButtonData.current.filter((f: any) => !denyResourceButtonList.some((s: any) => s.uri === f)) ?? [])
              : [];
            return {
              ...i,
              resourceList: updatePermissionData(
                initialRolePermissionData.current,
                [...(i?.resourceList?.map((item: any) => item.uri) ?? []), ...resourceButtonList],
                i.roleId === AdminRoleId
              ),
            };
          }) ?? [];
        setItems(info);
        initItems.current = info;
        setActiveKey(role?.[0]?.roleId);
      });
    }
  }, [open]);

  const onSave = () => {
    setLoading(true);
    const newValue = permissionRefs.current.get(activeKey)?.getValue?.();
    const { checkedFalseButtons, checkedTrueMenus } = filterMenuAndButtonItems(newValue);
    const allButton = checkedFalseButtons?.length === 0;
    putRole({
      id: activeKey,
      name: items?.find((i: any) => i.roleId === activeKey)?.roleName,
      denyResourceList: allButton ? [] : checkedFalseButtons?.map((item) => ({ uri: item })),
      allowResourceList: [...(checkedTrueMenus?.map?.((item) => ({ uri: item })) ?? []), { uri: 'button:*' }],
    })
      .then(() => {
        message.success(formatMessage('common.optsuccess'));
        setItems(
          produce(items, (draft) => {
            const info = draft.find((todo) => todo.roleId === activeKey);
            if (info) {
              info['resourceList'] = newValue;
            }
          })
        );
        initItems.current = initItems.current.map((item) => {
          if (item.roleId === activeKey) {
            return {
              ...item,
              resourceList: newValue,
            };
          } else {
            return item;
          }
        });
        unsavedChanges.current.set(activeKey, false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onChange = (key: string) => {
    if (unsavedChanges.current.get(activeKey)) {
      modal.confirm({
        title: formatMessage('common.unsavedChanges'),
        okText: formatMessage('common.save'),
        cancelText: formatMessage('common.unSave'),
        onOk: () => {
          onSave();
          setActiveKey(key);
        },
        onCancel: () => {
          const initPermission = initItems.current.find((item) => item.roleId === activeKey);
          permissionRefs.current.get(activeKey)?.setValue(initPermission?.resourceList);
          unsavedChanges.current.set(activeKey, false);
          setActiveKey(key);
        },
      });
    } else {
      setActiveKey(key);
    }
  };

  const RoleModal = (
    <ProModal
      afterClose={() => {
        unsavedChanges.current.clear();
        permissionRefs.current.clear();
        setItems([]);
        initItems.current = [];
      }}
      className={styles['role-setting']}
      size="sm"
      open={open}
      maskClosable={false}
      onCancel={onClose}
      title={
        <Flex justify="space-between" align="center" style={{ height: '100%' }}>
          <span>{formatMessage('account.roleSettings')}</span>
          <AddRoleContent
            successBack={(data) => {
              setItems((items) => {
                const newItems = [
                  ...items,
                  {
                    ...data,
                    resourceList: updatePermissionData(initialRolePermissionData.current, []),
                  },
                ];
                initItems.current = newItems;
                return newItems;
              });
              setActiveKey(data?.roleId);
            }}
            disabled={items?.length >= 10}
          />
        </Flex>
      }
    >
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              itemSelectedColor: 'var(--supos-theme-color)',
              zIndexPopup: 9999,
              horizontalMargin: '0 0 0 0',
            },
            Dropdown: {
              colorText: '#000',
            },
          },
        }}
      >
        <Loading spinning={loading}>
          <Tabs
            more={{
              overlayStyle: { '--supos-text-color': '#000' },
            }}
            onChange={onChange}
            activeKey={activeKey}
            items={items?.map((item: any) => {
              return {
                label: (
                  <Flex justify="space-between" align="center" gap={8}>
                    {item.roleName}
                    {item.roleId !== AdminRoleId && (
                      <Close
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          modal.confirm({
                            title: formatMessage('common.deleteConfirm'),
                            onOk: async () => {
                              return await deleteRole(item?.roleId).then(() => {
                                message.success(formatMessage('common.deleteSuccessfully'));
                                onSaveBack?.();
                                setItems(
                                  produce(items, (draft) => {
                                    const index = draft.findIndex((todo) => todo.roleId === item.roleId);
                                    if (index !== -1) {
                                      draft.splice(index, 1);
                                      if (activeKey === item.roleId) {
                                        setActiveKey(draft.filter((todo) => todo.roleId !== item.roleId)?.[0]?.roleId);
                                      }
                                    }
                                  })
                                );
                              });
                            },
                            okText: formatMessage('common.confirm'),
                          });
                        }}
                      />
                    )}
                  </Flex>
                ),
                key: item.roleId,
                children: (
                  <Permission
                    disabled={item.roleId === AdminRoleId}
                    ref={(el) => permissionRefs.current.set(item.roleId, el)}
                    initValue={item.resourceList}
                    onChange={(pre) => {
                      const currentDataString = JSON.stringify(pre);
                      const hasChanges =
                        currentDataString !==
                        JSON.stringify(initItems?.current?.find((i) => i.roleId === item.roleId)?.resourceList);
                      unsavedChanges.current.set(item.roleId, hasChanges);
                    }}
                  />
                ),
              };
            })}
          />
          <Button
            disabled={activeKey === AdminRoleId}
            onClick={onSave}
            style={{ height: 32, marginTop: 20 }}
            block
            type="primary"
            loading={loading}
          >
            {formatMessage('common.save')}
          </Button>
        </Loading>
      </ConfigProvider>
    </ProModal>
  );

  return {
    RoleModal,
    onRoleModalOpen,
  };
};

// 获取前端维护的button权限
const getPermission = (page: string) => {
  return Object.keys(ButtonPermission)
    .filter((key) => key.startsWith(getLatestCode(page) + '.'))
    .map((key: string) => {
      const id = ButtonPermission[key as keyof typeof ButtonPermission];
      const localKey: string = key.split('.')[1];
      const name = buttonLocal?.[localKey]?.[useI18nStore.getState().lang] ?? id;
      return {
        id,
        name,
        type: 'button',
        checked: false,
      };
    });
};

// 根据前端维护的路由
const getOtherRoutes = () => {
  return childrenRoutes
    ?.filter((route) => {
      return route?.handle?.parentPath === '/_common' && !['dev', 'all'].includes(route?.handle?.type || '');
    })
    ?.map((route) => {
      const children = [
        {
          key: route?.path,
          showName: route?.handle?.name,
          menuNameKey: route?.handle?.menuNameKey,
          menu: {
            url: route?.path,
          },
          isFrontend: true,
        },
      ];
      return {
        ...children[0],
        children,
        hasChildren: false,
      };
    });
};

// 根据前端维护的button、路由以及kong维护的路由进行初始化数据整合
const mapInitialRolePermissionData = (routes: any) => {
  return [...routes, ...getOtherRoutes()]?.map((group: any) => {
    return {
      id: 'group' + group?.key,
      name: group?.name ?? group?.showName,
      menuNameKey: group?.menuNameKey,
      type: 'group',
      checked: false,
      pagePermissionChecked: false,
      actionPermissionChecked: false,
      children: group?.children?.map((menu: any) => {
        const id = menu?.isFrontend ? menu?.menu?.url : '/' + menu?.key;
        return {
          id,
          name: menu?.showName ?? menu?.name,
          menuNameKey: menu?.menuNameKey,
          type: 'menu',
          checked: false,
          children: getPermission(id),
        };
      }),
    };
  });
};

// 过滤所有buttons的id
function extractButtonIds(data: PermissionNode[]): string[] {
  const buttonIds: string[] = [];

  function traverse(nodes: PermissionNode[]) {
    nodes.forEach((node) => {
      if (node.type === 'button') {
        buttonIds.push(node.id);
      }
      if (node.children && node.children.length) {
        traverse(node.children);
      }
    });
  }

  traverse(data);
  return buttonIds;
}

// 过滤出未选中的button和选中的menu
function filterMenuAndButtonItems(data: PermissionNode[] = []) {
  const result = {
    checkedTrueMenus: [] as string[], // type: "menu" && checked: true
    checkedFalseButtons: [] as string[], // type: "button" && checked: false
  };

  function traverse(items: PermissionNode[]) {
    items.forEach((item: PermissionNode) => {
      // 处理当前项
      if (item.type === 'menu' && item.checked) {
        result.checkedTrueMenus.push(item.id);
      } else if (item.type === 'button' && !item.checked) {
        result.checkedFalseButtons.push(item.id);
      }

      // 递归处理子项
      if (item.children && item.children.length) {
        traverse(item.children);
      }
    });
  }

  traverse(data);
  return result;
}

// 回显值
function updatePermissionData(data: any, idArray: string[], isAdmin: boolean = false) {
  const newData = JSON.parse(JSON.stringify(data));
  function updateChecked(items: any) {
    if (!items || !Array.isArray(items)) return;

    items.forEach((item: any) => {
      // 如果是管理员角色，直接设置所有节点为选中状态
      // 否则，检查当前项的id是否在idArray中
      if (isAdmin) {
        item.checked = true;
      } else if (idArray?.includes(item.id)) {
        item.checked = true;
      }

      if (item.children && item.children.length) {
        updateChecked(item.children);
      }
    });

    items.forEach((item: any) => {
      // 如果是group类型，检查并更新其状态
      if (item.type === 'group') {
        const menuNodes = item.children?.filter((child: any) => child.type === 'menu') || [];
        const buttonNodes =
          item.children
            ?.flatMap((child: any) => child.children || [])
            .filter((child: any) => child.type === 'button') || [];

        // 检查并更新pagePermissionChecked - 只受menu类型节点影响
        const allMenuChecked = menuNodes.length > 0 && menuNodes.every((menu: any) => menu.checked === true);
        // 如果任何菜单被选中，则页面权限部分选中
        item.pagePermissionChecked = allMenuChecked;

        // 检查并更新actionPermissionChecked - 只受button类型节点影响
        if (buttonNodes.length === 0) {
          item.actionPermissionChecked = false; // 设置默认值为false，确保禁用状态下始终为未选中
          item.actionPermissionCheckedDisabled = true; // 添加禁用标志
        } else {
          const allButtonsChecked = buttonNodes.every((button: any) => button.checked === true);
          item.actionPermissionChecked = allButtonsChecked;
          item.actionPermissionCheckedDisabled = false; // 有按钮时不禁用
        }
        item.checked =
          (buttonNodes.length === 0 && allMenuChecked) ||
          (menuNodes.length === 0 &&
            buttonNodes.length > 0 &&
            buttonNodes.every((button: any) => button.checked === true)) ||
          (menuNodes.length > 0 &&
            buttonNodes.length > 0 &&
            allMenuChecked &&
            buttonNodes.every((button: any) => button.checked === true));
      }
    });
  }

  updateChecked(newData);
  return newData;
}

export default useRoleSetting;
