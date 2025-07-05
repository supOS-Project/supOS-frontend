// import { MenuTypeEnum } from '@/stores/theme-store';
import { User, Menu as MenuIcon, Close, Task, TreeView as TreeViewIcon, Notification } from '@carbon/icons-react';
// import menuChangeDark from '@/assets/icons/menu-change-dark.svg';
import { useState, useEffect } from 'react';
import RoutesList from '@/layout/custom-nav/RoutesList';
import { useMenuNavigate, useTranslate, useMediaSize, useLocalStorage } from '@/hooks';
import { Divider, Menu, Splitter, Drawer, Badge } from 'antd';
import HMenuLabel from './components/HMenuLabel';
import { useNavigate, useLocation } from 'react-router-dom';
// import menuChange from '@/assets/icons/menu-change.svg';
import { SUPOS_STORAGE_MENU_WIDTH } from '@/common-types/constans.ts';
import HelpNav from '../components/HelpNav';
import './index.scss';
// import { ButtonPermission } from '@/common-types/button-permission.ts';
import LogoImg from '@/layout/custom-menu-header/components/LogoImg.tsx';
import { useUnsTreeMapContext } from '@/UnsTreeMapContext';
import { queryNoticeList } from '@/apis/inter-api/notify';
import IconImage from '@/components/icon-image';
import ComGroupButton from '@/components/com-group-button';
import ProModal from '@/components/pro-modal';
import SearchSelect from '@/components/search-select';
import { storageOpt } from '@/utils/storage';
import { useBaseStore } from '@/stores/base';
import { ThemeType, useThemeStore } from '@/stores/theme-store.ts';
import { isInIframe } from '@/utils/url-util.ts';

const CustomMenuHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickedGroupRoutes, currentMenuInfo, pluginList } = useBaseStore((state) => ({
    pickedGroupRoutes: state.pickedGroupRoutes,
    currentMenuInfo: state.currentMenuInfo,
    pluginList: state.pluginList,
  }));
  const { primaryColor, theme } = useThemeStore((state) => ({
    primaryColor: state.primaryColor,
    theme: state.theme,
  }));
  const isUnsPath = location.pathname.includes('/uns');
  const { isTreeMapVisible, setTreeMapVisible } = useUnsTreeMapContext();
  const handleNavigate = useMenuNavigate();
  const [openEdit, setEditOpen] = useState(false);
  const [hasNoticePlugin, setHasNoticePlugin] = useState(false);
  const [noticeDot, setNoticeDot] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const { width, isH5 } = useMediaSize();
  const formatMessage = useTranslate();
  const ignoreHeader = useLocalStorage('ignoreHeader');

  useEffect(() => {
    // 66rem = 1056px (1rem = 16px)
    if (width && width >= 640) {
      setDrawerVisible(false);
    }
  }, [width]);

  const getNoticeStatus = () => {
    queryNoticeList({ pageNo: 1, pageSize: 1, readStatus: 0 }).then((res: any) => {
      setNoticeDot(res?.total > 0);
    });
  };

  useEffect(() => {
    const noticePluginInstalled =
      pluginList?.find((i: any) => i?.plugInfoYml?.route?.name === 'NotificationManagement')?.installStatus ===
      'installed';
    setHasNoticePlugin(noticePluginInstalled);
  }, [pluginList]);

  useEffect(() => {
    if (hasNoticePlugin) getNoticeStatus();
  }, [hasNoticePlugin]);

  const navList = [...pickedGroupRoutes];

  const items = navList?.map?.((parent) => {
    if (parent.hasChildren) {
      return {
        icon: (
          <IconImage
            theme={primaryColor}
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
              theme={primaryColor}
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
            theme={primaryColor}
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
    <div
      className="custom-menu-header"
      style={{
        color: 'var(--supos-bg-color)',
        display: ignoreHeader === 'true' || window.name === 'equipment_app' ? 'none' : 'flex',
      }}
    >
      {/* 新手导航使用id */}
      <div className="custom-menu-header-left" id="custom_menu_left">
        <div className="header" style={{ color: 'var(--supos-text-color)' }}>
          <div className="menu-toggle" style={{ display: isH5 ? 'flex' : 'none' }}>
            {drawerVisible ? (
              <Close size={20} style={{ color: 'var(--supos-text-color)' }} onClick={() => setDrawerVisible(false)} />
            ) : (
              <MenuIcon size={20} style={{ color: 'var(--supos-text-color)' }} onClick={() => setDrawerVisible(true)} />
            )}
          </div>
          <div style={{ minWidth: 60, flexShrink: 0 }}>
            <LogoImg
              isDark={theme === ThemeType.Dark}
              onClick={() => {
                navigate('/home');
              }}
            />
          </div>
          <span className="title" title={currentMenuInfo?.name}>
            {currentMenuInfo?.name}
          </span>
          <Divider style={{ height: 24 }} type="vertical" />
        </div>
        <div className="content" style={{ display: !isH5 ? 'flex' : 'none' }}>
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
                  selectedKeys={currentMenuInfo?.selectKey ? currentMenuInfo?.selectKey : []}
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
                label: <Task size={20} style={{ color: 'var(--supos-text-color)' }} />,
                title: formatMessage('common.todo'),
                key: 'todo',
                onClick: handleTodoClick,
              },
              {
                label: (
                  <Badge dot={noticeDot}>
                    <Notification size={20} style={{ color: 'var(--supos-text-color)' }} />
                  </Badge>
                ),
                title: 'notice',
                key: 'notice',
                onClick: getNoticeStatus,
                hidden: !hasNoticePlugin,
              },
              {
                label: <User size={20} style={{ color: 'var(--supos-text-color)' }} />,
                title: 'user',
                key: 'user',
              },
              // {
              //   auth: ButtonPermission['common.routerEdit'],
              //   label: <Edit size={20} style={{ color: 'var(--supos-text-color)' }} />,
              //   title: formatMessage('common.edit', 'Edit'),
              //   key: 'edit',
              //   onClick: () => setEditOpen(true),
              // },
              // {
              //   label: (
              //     <img
              //       src={themeStore.theme.includes('dark') ? menuChangeDark : menuChange}
              //       style={{
              //         width: 20,
              //         height: 20,
              //       }}
              //     />
              //   ),
              //   key: 'change',
              //   title: formatMessage('common.change', 'change'),
              //   onClick: () => themeStore.setMenuType(MenuTypeEnum.Fixed),
              // },
            ]?.filter((i) => i.key !== 'user' || (i.key === 'user' && !isInIframe([], 'webview')))}
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
        <Menu mode="inline" items={items} selectedKeys={currentMenuInfo?.selectKey ? currentMenuInfo?.selectKey : []} />
      </Drawer>
      <ProModal
        destroyOnHidden
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

export default CustomMenuHeader;
