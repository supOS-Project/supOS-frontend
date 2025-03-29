import { FC } from 'react';
import { SideNav, SideNavItems, SideNavLink, SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { RoutesProps } from '@/stores/types';
import { Flex } from 'antd';
import { useMenuNavigate } from '@/hooks';
import styles from './index.module.scss';
import { IconImage } from '@/components';
import { useThemeContext } from '@/contexts/theme-context.ts';
import { observer } from 'mobx-react-lite';

const SideNavList: FC<{ navList: RoutesProps[]; selectedKeys: string[] }> = ({ navList, selectedKeys }) => {
  const handleNavigate = useMenuNavigate();
  const themeStore = useThemeContext();
  return (
    <SideNav className={styles['side-nav-list']} expanded={true} isChildOfHeader={false} aria-label="Side navigation">
      <SideNavItems>
        {navList?.map((parent) => {
          if (parent.hasChildren) {
            return (
              <SideNavMenu
                isActive={selectedKeys.includes(parent.key!)}
                renderIcon={() => (
                  <IconImage
                    theme={themeStore.theme}
                    iconName={parent.iconUrl}
                    width={'0.875rem'}
                    height={'0.875rem'}
                  />
                )}
                title={parent.name}
                key={parent.key!}
              >
                {parent?.children?.map((child) => {
                  return (
                    <>
                      <SideNavMenuItem
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleNavigate(child)}
                        key={child.key!}
                        isActive={selectedKeys.includes(child.key!)}
                      >
                        <Flex align="center" gap={4}>
                          <IconImage
                            theme={themeStore.theme}
                            iconName={child.iconUrl}
                            width={'0.875rem'}
                            height={'0.875rem'}
                          />
                          {child.name}
                        </Flex>
                      </SideNavMenuItem>
                    </>
                  );
                })}
              </SideNavMenu>
            );
          }
          return (
            <SideNavLink
              style={{ cursor: 'pointer' }}
              onClick={() => handleNavigate(parent)}
              key={parent.key!}
              isActive={selectedKeys.includes(parent.key!)}
            >
              <Flex align="center" gap={4}>
                <IconImage theme={themeStore.theme} iconName={parent.iconUrl} width={'0.875rem'} height={'0.875rem'} />
                {parent.name}
              </Flex>
            </SideNavLink>
          );
        })}
      </SideNavItems>
    </SideNav>
  );
};

export default observer(SideNavList);
