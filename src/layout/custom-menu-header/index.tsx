import { useThemeContext } from '@/contexts/theme-context';
import { MenuTypeEnum } from '@/stores/theme-store';
import { Edit, User, Menu as MenuIcon, Close, ListBoxes, TreeView as TreeViewIcon } from '@carbon/icons-react';
import menuChangeDark from '@/assets/icons/menu-change-dark.svg';
import { useState, useEffect } from 'react';
import RoutesList from '@/layout/custom-nav/RoutesList';
import { useRoutesContext } from '@/contexts/routes-context';
import { useMenuNavigate, useTranslate } from '@/hooks';
import { Divider, Menu, Splitter, Drawer } from 'antd';
import HMenuLabel from './components/HMenuLabel';
import { ComGroupButton, SearchSelect, ProModal, IconImage } from '@/components';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom';
import menuChange from '@/assets/icons/menu-change.svg';
import { storageOpt } from '@/utils';
import { SUPOS_STORAGE_MENU_WIDTH } from '@/common-types/constans.ts';
import HelpNav from '../components/HelpNav';
import './index.scss';
import { useMediaSize } from '@/hooks';
import { ButtonPermission } from '@/common-types/button-permission.ts';
import LogoImg from '@/layout/custom-menu-header/components/LogoImg.tsx';
import { useUnsTreeMapContext } from '@/UnsTreeMapContext';

const CustomMenuHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isUnsPath = location.pathname.includes('/uns');
  const { isTreeMapVisible, setTreeMapVisible } = useUnsTreeMapContext();
  const handleNavigate = useMenuNavigate();
  const routesStore = useRoutesContext();
  const themeStore = useThemeContext();
  const [openEdit, setEditOpen] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const { width, isH5 } = useMediaSize();
  const formatMessage = useTranslate();
  useEffect(() => {
    // 66rem = 1056px (1rem = 16px)
    if (width && width >= 640) {
      setDrawerVisible(false);
    }
  }, [width]);
  const navList = [
    // eslint-disable-next-line no-unsafe-optional-chaining
    ...routesStore?.pickedGroupRoutes,
  ];

  const items = navList?.map?.((parent) => {
    if (parent.hasChildren) {
      return {
        icon: (
          <IconImage
            theme={themeStore.theme}
            iconName={parent.iconUrl}
            width={24}
            height={24}
            style={{ paddingRight: 4, verticalAlign: 'middle' }}
          />
        ),
        key: parent.key!,
        label: <HMenuLabel label={parent.name} iconUrl={parent.iconUrl} />,
        children: parent?.children?.map((child) => ({
          key: child.key!,
          icon: (
            <IconImage
              theme={themeStore.theme}
              iconName={child.iconUrl}
              width={24}
              height={24}
              style={{ paddingRight: 4, verticalAlign: 'middle' }}
            />
          ),
          onClick: () => {
            handleNavigate(child);
          },
          label: <HMenuLabel label={child.name} iconUrl={child.iconUrl} />,
        })),
      };
    } else {
      return {
        icon: (
          <IconImage
            theme={themeStore.theme}
            iconName={parent.iconUrl}
            width={24}
            height={24}
            style={{ paddingRight: 4, verticalAlign: 'middle' }}
          />
        ),
        key: parent.key!,
        label: <HMenuLabel label={parent.name} iconUrl={parent.iconUrl} />,
        onClick: () => {
          handleNavigate(parent);
        },
      };
    }
  });
  const handleTodoClick = (e: any) => {
    navigate(e.key);
  };
  return (
    <div className="custom-menu-header" style={{ color: 'var(--supos-bg-color)' }}>
      {/* 新手导航使用id */}
      <div className="custom-menu-header-left" id="custom_menu_left">
        <div className="header" style={{ color: 'var(--supos-text-color)' }}>
          <div className="menu-toggle">
            {drawerVisible ? (
              <Close size={20} style={{ color: 'var(--supos-text-color)' }} onClick={() => setDrawerVisible(false)} />
            ) : (
              <MenuIcon size={20} style={{ color: 'var(--supos-text-color)' }} onClick={() => setDrawerVisible(true)} />
            )}
          </div>
          <div style={{ width: 60 }}>
            <LogoImg
              isDark={themeStore.theme.includes('dark')}
              onClick={() => {
                navigate('/home');
              }}
            />
          </div>
          <span className="title" title={routesStore.currentMenuInfo?.name}>
            {routesStore.currentMenuInfo?.name}
          </span>
          <Divider style={{ height: 24 }} type="vertical" />
        </div>
        <div className="content">
          <Splitter
            style={{
              height: '100%',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
            onResizeEnd={(size) => {
              storageOpt.set(SUPOS_STORAGE_MENU_WIDTH, size?.[0]);
            }}
          >
            <Splitter.Panel
              defaultSize={storageOpt.get(SUPOS_STORAGE_MENU_WIDTH) || 50}
              style={{ minWidth: 50 }}
              min={50}
              max="70%"
            >
              <div className="menu">
                <Menu
                  mode="horizontal"
                  items={items}
                  selectedKeys={routesStore?.currentMenuInfo?.selectKey ? routesStore.currentMenuInfo?.selectKey : []}
                />
              </div>
            </Splitter.Panel>
            <Splitter.Panel>
              {/*渲染tabs header的div*/}
              <div className="tabs" id="custom-header-container"></div>
            </Splitter.Panel>
          </Splitter>
        </div>
      </div>
      <div className="footer" id="custom_menu_right">
        {isUnsPath && isH5 ? (
          <ComGroupButton
            options={[
              {
                label: (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <TreeViewIcon size={20} style={{ color: 'var(--supos-text-color)' }} />
                    <span style={{ color: 'var(--supos-text-color)' }}>{formatMessage('uns.tree')}</span>
                    {isTreeMapVisible && <Close size={20} style={{ color: 'var(--supos-text-color)' }} />}
                  </div>
                ),
                title: 'treemap',
                key: 'treemap',
                style: {
                  width: '128px',
                  ...(isTreeMapVisible && {
                    boxShadow: '-2px -2px 4px rgba(0, 0, 0, 0.1)',
                  }),
                },
                onClick: () => {
                  console.log(isTreeMapVisible);
                  setTreeMapVisible(!isTreeMapVisible);
                },
              },
            ]}
          />
        ) : (
          <ComGroupButton
            options={[
              {
                label: (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'var(--supos-text-color)',
                    }}
                  >
                    <SearchSelect />
                  </div>
                ),
                noHoverStyle: true,
                title: 'search',
                key: 'search',
                style: { width: 'auto', padding: '0' },
              },
              {
                label: <HelpNav />,
                key: 'help',
              },
              {
                label: <ListBoxes size={20} style={{ color: 'var(--supos-text-color)' }} />,
                title: formatMessage('common.todo'),
                key: 'todo',
                onClick: handleTodoClick,
              },
              {
                label: <User size={20} style={{ color: 'var(--supos-text-color)' }} />,
                title: 'user',
                key: 'user',
              },
              {
                auth: ButtonPermission['common.routerEdit'],
                label: <Edit size={20} style={{ color: 'var(--supos-text-color)' }} />,
                title: formatMessage('common.edit', 'Edit'),
                key: 'edit',
                onClick: () => setEditOpen(true),
              },
              {
                label: (
                  <img
                    src={themeStore.theme.includes('dark') ? menuChangeDark : menuChange}
                    style={{
                      width: 20,
                      height: 20,
                    }}
                  />
                ),
                key: 'change',
                title: formatMessage('common.change', 'change'),
                onClick: () => themeStore.setMenuType(MenuTypeEnum.Fixed),
              },
            ]}
          />
        )}
      </div>

      <Drawer
        className="custom-menu-header-drawer"
        rootClassName="custom-menu-header-drawer-root"
        placement="left"
        mask={false}
        // autoFocus={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={256}
      >
        <Menu
          mode="inline"
          items={items}
          selectedKeys={routesStore?.currentMenuInfo?.selectKey ? routesStore.currentMenuInfo?.selectKey : []}
        />
      </Drawer>
      <ProModal
        destroyOnClose
        size="xs"
        open={openEdit}
        maskClosable={false}
        onCancel={() => setEditOpen(false)}
        title={formatMessage('common.menuList', 'Menu List')}
      >
        <RoutesList open={openEdit} setOpen={setEditOpen} />
      </ProModal>
    </div>
  );
};

export default observer(CustomMenuHeader);
