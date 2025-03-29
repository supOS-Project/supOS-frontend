import { ProModal, Loading, IconImage } from '@/components';
import { useTranslate } from '@/hooks';
import { Suspense, useEffect, useState } from 'react';
import { Checkbox, Col, ConfigProvider, Empty, Flex, Row, Tabs } from 'antd';
import styles from './RoleSetting.module.scss';
import { getRoleList } from '@/apis/inter-api/user-manage.ts';
import { DataItem, RoutesProps } from '@/stores/types.ts';
import { observer } from 'mobx-react-lite';
import { useRoutesContext } from '@/contexts/routes-context.ts';
import {
  Criteria,
  filterByMatch,
  filterObjectArrays,
  getGroupedData,
  getTags,
  multiGroupByCondition,
} from '@/stores/utils.ts';
import { useThemeContext } from '@/contexts/theme-context.ts';

const parentOrderMap = (routes: any) => {
  const info = routes?.find((f: any) => getTags(f?.service?.tags || [])?.root);
  return getTags(info?.service?.tags || []) || {};
};
const RoutesList = observer(({ resourceList }: { resourceList: any }) => {
  const routesStore = useRoutesContext();
  const themeStore = useThemeContext();
  const [routes, setRoutes] = useState<RoutesProps[]>([]);
  // father
  const [checkAllList, setCheckAllList] = useState<boolean[]>([]);
  const [indeterminateList, setIndeterminateList] = useState<boolean[]>([]);
  useEffect(() => {
    const criteria: Criteria<DataItem> = {
      buttonGroup: (item: any) => item?.uri?.includes('button:'),
    };
    const { others } = multiGroupByCondition(resourceList, criteria);
    const pickedRouters = filterObjectArrays([], others);
    const routes = filterByMatch(routesStore.rawRoutes, pickedRouters, true);
    const allRoutes = getGroupedData(routes, parentOrderMap);
    setRoutes(allRoutes);
    const checkeds: string[][] = [];
    const checksAll: boolean[] = [];
    const indeterminates: boolean[] = [];
    allRoutes.forEach((routes) => {
      const check = routes?.children?.filter((m) => m)?.map((m) => m.key!) || [];
      checkeds.push(check);
      const isAll = check?.length === routes.children?.length;
      checksAll.push(isAll);
      indeterminates.push(!isAll && check?.length > 0);
    });
    setCheckedLists(checkeds);
    setIndeterminateList(indeterminates);
    setCheckAllList(checksAll);
  }, [resourceList, routesStore.rawRoutes]);

  const [checkedLists, setCheckedLists] = useState<string[][]>([]);
  const onGroupChange = (index: number, list: string[]) => {
    const updatedCheckedLists = [...checkedLists];
    updatedCheckedLists[index] = list;
    setCheckedLists(updatedCheckedLists);

    const isAllChecked = list.length === routes[index]?.children?.length;
    const updatedIndeterminateList = [...indeterminateList];
    const updatedCheckAllList = [...checkAllList];
    updatedIndeterminateList[index] = list.length > 0 && !isAllChecked;
    updatedCheckAllList[index] = isAllChecked;
    setIndeterminateList(updatedIndeterminateList);
    setCheckAllList(updatedCheckAllList);
  };

  const onGroupCheckAllChange = (index: number, checked: boolean) => {
    const updatedCheckedLists = [...checkedLists];
    updatedCheckedLists[index] = checked ? routes[index].children?.map((c) => c.key!) || [] : [];
    setCheckedLists(updatedCheckedLists);

    // 更新该组的全选状态
    const updatedIndeterminateList = [...indeterminateList];
    const updatedCheckAllList = [...checkAllList];
    updatedIndeterminateList[index] = false;
    updatedCheckAllList[index] = checked;
    setIndeterminateList(updatedIndeterminateList);
    setCheckAllList(updatedCheckAllList);
  };
  return (
    <div style={{ height: 400, overflow: 'auto', marginBottom: 20 }}>
      <Suspense fallback={<Empty />}>
        {routes?.map?.((route, index) => {
          return (
            <div key={route.key!}>
              <Row justify="space-between" style={{ borderBottom: '1px solid #ddd', padding: '4px 8px' }}>
                <Col
                  style={{
                    color: checkAllList[index] ? 'var(--supos-check-color)' : 'var(--supos-nocheck-color)',
                    fontWeight: 500,
                  }}
                >
                  <Flex align="center" gap={4}>
                    <IconImage theme={themeStore.theme} iconName={route.iconUrl} width={20} height={20} />
                    {route.name}
                  </Flex>
                </Col>
                <Col style={{ display: 'none' }}>
                  <Checkbox
                    onChange={(e) => onGroupCheckAllChange(index, e.target.checked)}
                    indeterminate={indeterminateList[index]}
                    checked={checkAllList[index]}
                  />
                </Col>
              </Row>
              <Checkbox.Group
                style={{ width: '100%', display: route?.hasChildren ? 'inherit' : 'none' }}
                value={checkedLists[index]}
                onChange={(list) => onGroupChange(index, list)}
              >
                {route?.children?.map?.((childRoute) => (
                  <Row
                    key={childRoute.key}
                    justify="space-between"
                    style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', paddingLeft: 40 }}
                  >
                    <Col
                      style={{
                        color: checkedLists[index]?.includes?.(childRoute.key!)
                          ? 'var(--supos-check-color)'
                          : 'var(--supos-nocheck-color)',
                      }}
                    >
                      <Flex align="center" gap={4}>
                        <IconImage theme={themeStore.theme} iconName={childRoute.iconUrl} width={20} height={20} />
                        {childRoute.name}
                      </Flex>
                    </Col>
                    <Col>
                      <Checkbox value={childRoute.key!} style={{ display: 'none' }} />
                    </Col>
                  </Row>
                ))}
              </Checkbox.Group>
            </div>
          );
        })}
      </Suspense>
    </div>
  );
});

const useRoleSetting = () => {
  const formatMessage = useTranslate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const onRoleModalOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setLoading(true);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      getRoleList()
        .then((data: any) => {
          setItems(data ?? []);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const RoleModal = (
    <ProModal
      className={styles['role-setting']}
      size="xs"
      open={open}
      maskClosable={false}
      onCancel={onClose}
      title={formatMessage('account.roleSettings')}
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
            items={items?.map((item: any) => ({
              label: item.roleName,
              key: item.roleId,
              children: <RoutesList resourceList={item.resourceList} />,
            }))}
          />
        </Loading>
      </ConfigProvider>
    </ProModal>
  );

  return {
    RoleModal,
    onRoleModalOpen,
  };
};

export default useRoleSetting;
