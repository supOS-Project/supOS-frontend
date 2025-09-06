import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react';
import { Button as AntButton, Checkbox, Col, ConfigProvider, Flex, message, Row } from 'antd';
import { ResourceProps } from '@/stores/types';
import { useTranslate } from '@/hooks';
import IconImage from '@/components/icon-image';
import { fetchBaseStore, postRoutes, useBaseStore } from '@/stores/base';
import { useThemeStore } from '@/stores/theme-store.ts';

const _theme = {
  token: {
    colorBgContainer: 'white', // 修改主色调
    colorPrimary: '#000',
    borderRadiusSM: 0,
  },
};

const RoutesList: FC<{ open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }> = ({ open, setOpen }) => {
  const [routes, setRoutes] = useState<ResourceProps[]>([]);
  const originRoutes = useRef<ResourceProps[]>([]);
  const formatMessage = useTranslate();
  const primaryColor = useThemeStore((state) => state.primaryColor);

  const { allRoutes } = useBaseStore((state) => ({
    allRoutes: state.originMenu?.filter((item) => item.type == 2),
  }));

  // father
  const [checkAllList, setCheckAllList] = useState<boolean[]>([]);
  const [indeterminateList, setIndeterminateList] = useState<boolean[]>([]);
  // childrenGroup
  const [checkedLists, setCheckedLists] = useState<string[][]>([]);

  useEffect(() => {
    if (!open) return;
    fetchBaseStore?.()?.then((data: ResourceProps[]) => {
      originRoutes.current = data;
      setRoutes(allRoutes);
      const checkeds: string[][] = [];
      const checksAll: boolean[] = [];
      const indeterminates: boolean[] = [];
      allRoutes.forEach((routes) => {
        const check = routes?.children?.filter((m) => m?.enable)?.map((m) => m.code!) || [];
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
      if (checkedList?.includes(m?.code)) {
        return {
          menuName: m?.code,
          picked: true,
        };
      } else {
        return {
          menuName: m?.code,
          picked: false,
        };
      }
    });
    postRoutes?.(params).then(() => {
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
    updatedCheckedLists[index] = checked ? routes[index].children?.map((c) => c.code!) || [] : [];
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
    <ConfigProvider theme={_theme}>
      <div style={{ maxHeight: 400, overflow: 'auto', marginBottom: 20 }}>
        {routes?.map?.((route, index) => {
          return (
            <div key={route.code!}>
              <Row justify="space-between" style={{ borderBottom: '1px solid #ddd', padding: '4px 8px' }}>
                <Col
                  style={{
                    color: checkAllList[index] ? 'var(--supos-check-color)' : 'var(--supos-nocheck-color)',
                    fontWeight: 500,
                  }}
                >
                  <Flex align="center" gap={4}>
                    <IconImage theme={primaryColor} iconName={route.icon} width={20} height={20} />
                    {route.showName}
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
                style={{ width: '100%', display: !route?.children?.length ? 'inherit' : 'none' }}
                value={checkedLists[index]}
                onChange={(list) => onGroupChange(index, list)}
              >
                {route?.children?.map?.((childRoute) => (
                  <Row
                    key={childRoute.code}
                    justify="space-between"
                    style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', paddingLeft: 40 }}
                  >
                    <Col
                      style={{
                        color: checkedLists[index]?.includes?.(childRoute.code!)
                          ? 'var(--supos-check-color)'
                          : 'var(--supos-nocheck-color)',
                      }}
                    >
                      <Flex align="center" gap={4}>
                        <IconImage theme={primaryColor} iconName={childRoute.icon} width={20} height={20} />
                        {childRoute.showName}
                      </Flex>
                    </Col>
                    <Col>
                      <Checkbox value={childRoute.code!} />
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

export default RoutesList;
