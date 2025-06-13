import { FC } from 'react';
import { Flex, Menu } from 'antd';
import { RoutesProps } from '@/stores/types';
import { useMenuNavigate } from '@/hooks';
import styles from './index.module.scss';
import IconImage from '@/components/icon-image';
import { useThemeStore } from '@/stores/theme-store.ts';

const SideNavList: FC<{ navList: RoutesProps[]; selectedKeys: string[] }> = ({ navList, selectedKeys }) => {
  const handleNavigate = useMenuNavigate();
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const theme = useThemeStore((state) => state.theme);

  const createMenuItems = (): any[] => {
    return navList?.map((parent) => {
      if (parent.hasChildren) {
        return {
          key: parent.key!,
          label: parent.name,
          icon: <IconImage theme={primaryColor} iconName={parent.iconUrl} width={'0.875rem'} height={'0.875rem'} />,
          children: parent.children?.map((child) => ({
            key: child.key!,
            label: (
              <div>
                <Flex align="center" gap={4}>
                  <IconImage theme={primaryColor} iconName={child.iconUrl} width={'0.875rem'} height={'0.875rem'} />
                  {child.name}
                </Flex>
              </div>
            ),
            onClick: () => {
              handleNavigate(child);
            },
          })),
        };
      }

      return {
        key: parent.key!,
        label: (
          <div onClick={() => handleNavigate(parent)}>
            <Flex align="center" gap={4}>
              <IconImage theme={primaryColor} iconName={parent.iconUrl} width={'0.875rem'} height={'0.875rem'} />
              {parent.name}
            </Flex>
          </div>
        ),
        onClick: () => {
          handleNavigate(parent);
        },
      };
    });
  };
  return (
    <Menu
      className={styles['side-nav-list']}
      mode="inline"
      selectedKeys={selectedKeys}
      theme={theme === 'dark' ? 'dark' : 'light'}
      items={createMenuItems()}
    />
  );
};

export default SideNavList;
