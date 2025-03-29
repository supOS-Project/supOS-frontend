import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react';
import { Button as AntButton, Checkbox, Col, ConfigProvider, Flex, message, Row } from 'antd';
import { RoutesProps } from '@/stores/types';
import { getGroupedData } from '@/stores/utils';
import { useRoutesContext } from '@/contexts/routes-context';
import { useTranslate } from '@/hooks';
import { IconImage } from '@/components';
import { useThemeContext } from '@/contexts/theme-context.ts';
import { observer } from 'mobx-react-lite';

const theme = {
  token: {
    colorBgContainer: 'white', // 修改主色调
    colorPrimary: '#000',
    borderRadiusSM: 0,
  },
};

const RoutesList: FC<{ open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }> = ({ open, setOpen }) => {
  const [routes, setRoutes] = useState<RoutesProps[]>([]);
  const originRoutes = useRef<RoutesProps[]>([]);
  const routesStore = useRoutesContext();
  const formatMessage = useTranslate();
  const themeStore = useThemeContext();

  // father
  const [checkAllList, setCheckAllList] = useState<boolean[]>([]);
  const [indeterminateList, setIndeterminateList] = useState<boolean[]>([]);
  // childrenGroup
  const [checkedLists, setCheckedLists] = useState<string[][]>([]);

  useEffect(() => {
    if (!open) return;
    routesStore?.fetchRoutes?.()?.then((data: RoutesProps[]) => {
      originRoutes.current = data;
      const allRoutes = getGroupedData(data, routesStore.parentOrderMap);
      setRoutes(allRoutes);
      const checkeds: string[][] = [];
      const checksAll: boolean[] = [];
      const indeterminates: boolean[] = [];
      allRoutes.forEach((routes) => {
        const check = routes?.children?.filter((m) => m.menu?.picked)?.map((m) => m.key!) || [];
        checkeds.push(check);
        const isAll = check?.length === routes.children?.length;
        checksAll.push(isAll);
        indeterminates.push(!isAll && check?.length > 0);
      });
      setCheckedLists(checkeds);
      setIndeterminateList(indeterminates);
      setCheckAllList(checksAll);
    });
  }, [open]);

  const onSave = () => {
    const checkedList = checkedLists.flat(1);
    const params = originRoutes.current?.map((m) => {
      if (checkedList?.includes(m?.name)) {
        return {
          menuName: m?.name,
          picked: true,
        };
      } else {
        return {
          menuName: m?.name,
          picked: false,
        };
      }
    });
    routesStore?.postRoutes?.(params).then(() => {
      setCheckAllList([]);
      setIndeterminateList([]);
      setCheckedLists([]);
      setOpen(false);
      message.success(formatMessage('common.updateRouteSuccess'));
    });
  };
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
    <ConfigProvider theme={theme}>
      <div style={{ maxHeight: 400, overflow: 'auto', marginBottom: 20 }}>
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
                <Col>
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
                      <Checkbox value={childRoute.key!} />
                    </Col>
                  </Row>
                ))}
              </Checkbox.Group>
            </div>
          );
        })}
      </div>
      <AntButton block color="default" variant="solid" onClick={onSave}>
        {formatMessage('common.save')}
      </AntButton>
    </ConfigProvider>
  );
};

export default observer(RoutesList);
