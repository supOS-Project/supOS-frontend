import { FC, useEffect, useRef, useState } from 'react';
import { RoutesProps } from '@/stores/types';
import { ConfigProvider, Flex, Menu, MenuProps } from 'antd';
import { useMenuNavigate } from '@/hooks';
import { observer } from 'mobx-react-lite';
import styles from './index.module.scss';
import { IconImage } from '@/components';
import { useThemeContext } from '@/contexts/theme-context.ts';

type MenuItem = Required<MenuProps>['items'][number];
const SideMenuList: FC<{
  navList: RoutesProps[];
  openHoverNav: boolean;
  setOpenHoverNav: any;
  selectedKeys: string[];
}> = ({ navList, openHoverNav, setOpenHoverNav, selectedKeys }) => {
  const themeStore = useThemeContext();
  const handleNavigate = useMenuNavigate();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [menuSelectedKeys, setSelectedKeys] = useState<string[]>([]);
  const menuRef = useRef(null);
  const handleClickOutside = (event: any) => {
    if (menuRef.current) {
      if (event.target.closest('.imgWrap')) return;
      if (event.target.closest('.ant-menu-submenu-popup')) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (!menuRef.current.contains(event.target)) {
        setOpenHoverNav(false);
      }
    }
  };
  useEffect(() => {
    // 当 menu 打开时，监听点击事件
    if (openHoverNav) {
      setItems(
        navList?.map?.((parent) => {
          if (parent.hasChildren) {
            return {
              key: parent.key!,
              label: (
                <Flex align="center" gap={4} className={styles['side-menu-list-item']}>
                  <IconImage theme={themeStore.theme} iconName={parent.iconUrl} width={24} height={24} />
                  {parent.name}
                </Flex>
              ),
              children: parent?.children?.map((child) => ({
                key: child.key!,
                onClick: () => {
                  handleNavigate(child);
                  setOpenHoverNav?.(false);
                },
                label: (
                  <Flex align="center" gap={4} className={styles['side-menu-list-item']}>
                    <IconImage theme={themeStore.theme} iconName={child.iconUrl} width={24} height={24} />
                    {child.name}
                  </Flex>
                ),
              })),
            };
          } else {
            return {
              key: parent.key!,
              label: (
                <Flex align="center" gap={4} className={styles['side-menu-list-item']}>
                  <IconImage theme={themeStore.theme} iconName={parent.iconUrl} width={24} height={24} />
                  {parent.name}
                </Flex>
              ),
              onClick: () => {
                handleNavigate(parent);
                setOpenHoverNav?.(false);
              },
            };
          }
        })
      );
      setTimeout(() => {
        setSelectedKeys(selectedKeys);
      });
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      setItems([]);
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // 组件卸载时清除事件监听器
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openHoverNav]);

  return openHoverNav ? (
    <div ref={menuRef}>
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemSelectedColor: 'var(--supos-theme-color)',
            },
          },
        }}
      >
        <Menu
          key={selectedKeys.join(',')}
          style={{ width: 174, maxHeight: 500 }}
          selectedKeys={menuSelectedKeys}
          items={items}
        />
      </ConfigProvider>
    </div>
  ) : null;
};

export default observer(SideMenuList);
