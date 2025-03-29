import { useState } from 'react';
import { Flex } from 'antd';
import { ChevronDown, Edit, User, ListBoxes } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { AuthWrapper, ProModal, DraggableContainer, SearchSelect, UserPopover } from '@/components';
import logoBlack from '@/assets/custom-nav/logo-black.png';
import logoBlackWhite from '@/assets/custom-nav/logo-white.png';
import RoutesList from '@/layout/custom-nav/RoutesList';
import { useRoutesContext } from '@/contexts/routes-context';
import { observer } from 'mobx-react-lite';
import SideNavList from './components/SideNavList';
import SideMenuList from './components/SideMenuList';
import menuChange from '@/assets/icons/menu-change.svg';
import menuChangeDark from '@/assets/icons/menu-change-dark.svg';
import menuDown from '@/assets/icons/menu-down.svg';
import menuLightUp from '@/assets/icons/menu-light-up.svg';
import upDark from '@/assets/icons/up-dark.svg';
import downDark from '@/assets/icons/down-dark.svg';
import { useThemeContext } from '@/contexts/theme-context';
import { MenuTypeEnum } from '@/stores/theme-store.ts';
import { useTranslate } from '@/hooks';
import HelpNav from '../components/HelpNav';
import './index.scss';
import { ButtonPermission } from '@/common-types/button-permission.ts';

const Module = () => {
  const navigate = useNavigate();
  const routesStore = useRoutesContext();
  const themeStore = useThemeContext();
  const formatMessage = useTranslate();
  const navList = [
    // eslint-disable-next-line no-unsafe-optional-chaining
    ...routesStore?.pickedGroupRoutes,
  ];

  const [openEdit, setEditOpen] = useState(false);
  const [openHoverNav, setOpenHoverNav] = useState(false);

  // const navigate = useNavigate();
  const [showAllNav, setShowAllNav] = useState(false);

  const [searchOpen, setSearchOpen] = useState(true);
  // const goPath = (path: string) => {
  //   navigate(path);
  // };

  return (
    <DraggableContainer>
      {/*  <div className={`navWrapFixed navWrapLight ${isdark != 'light' ? 'navWrapDark' : 'navWrapLight'}`}> */}
      <div className={`navWrapFixed navWrapLight`}>
        <div
          className="navWrap"
          style={{
            height: showAllNav ? 'calc(100vh - 20px)' : '46px',
            width: searchOpen ? '280px' : '400px',
          }}
        >
          <div className="navTop">
            <div
              className="imgWrap"
              style={{
                opacity: openHoverNav ? 0.2 : 1,
                '--color-font': 'var(--supos-text-color)',
              }}
              onClick={() => {
                setOpenHoverNav((pre) => !pre);
                setShowAllNav(false);
                setSearchOpen(true);
              }}
            >
              <img src={themeStore.theme.includes('dark') ? logoBlackWhite : logoBlack} />
              <span style={{ margin: '0 5px' }} title={routesStore.currentMenuInfo?.name}>
                {routesStore.currentMenuInfo?.name}
              </span>
              <ChevronDown />
            </div>
            <Flex style={{ height: '100%' }}>
              <div
                className="navTopIcon"
                onClick={() => {
                  setShowAllNav((pre) => !pre);
                  setOpenHoverNav(false);
                  setSearchOpen(true);
                }}
              >
                {themeStore.theme.includes('dark') ? (
                  <img src={showAllNav ? upDark : downDark} />
                ) : (
                  <img src={showAllNav ? menuLightUp : menuDown} />
                )}
              </div>
              <div style={{ cursor: 'pointer' }}>
                <SearchSelect value={searchOpen} onChange={setSearchOpen} selectStyle={{ height: 44 }} />
              </div>
              <div className="navTopIcon" onClick={() => themeStore.setMenuType(MenuTypeEnum.Top)}>
                <img
                  src={themeStore.theme.includes('dark') ? menuChangeDark : menuChange}
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              </div>
            </Flex>
          </div>
          <div className="navContent">
            <SideNavList navList={navList} selectedKeys={routesStore.currentMenuInfo?.selectKeyPath ?? []} />
          </div>
          <div className="navBottom">
            <div className="iconWrap">
              {/*<div*/}
              {/*  className="iconWrapper"*/}
              {/*  onClick={() => {*/}
              {/*    goPath('/setting');*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <Settings size={18} />*/}
              {/*</div>*/}
              <div className="iconWrapper" style={{ padding: 0 }}>
                <HelpNav />
              </div>
              <div
                className="iconWrapper"
                style={{ padding: 0 }}
                onClick={() => {
                  navigate('/todo');
                }}
              >
                <ListBoxes size={20} style={{ color: 'var(--supos-text-color)' }} />
              </div>
              <UserPopover zIndex={10000} placement={'top'}>
                <div className="iconWrapper">
                  <User size={18} />
                </div>
              </UserPopover>

              <AuthWrapper auth={ButtonPermission['common.routerEdit']}>
                <div className="iconWrapper" onClick={() => setEditOpen(true)}>
                  <Edit size={18} />
                </div>
              </AuthWrapper>
            </div>
          </div>
        </div>
        {!showAllNav && openHoverNav && (
          <div className="navHoverContent">
            <SideMenuList
              openHoverNav={openHoverNav}
              navList={navList}
              selectedKeys={routesStore.currentMenuInfo?.selectKey ? routesStore.currentMenuInfo?.selectKey : []}
              setOpenHoverNav={setOpenHoverNav}
            />
          </div>
        )}
      </div>
      {/*menuList弹框*/}
      <ProModal
        size="xs"
        open={openEdit}
        maskClosable={false}
        onCancel={() => setEditOpen(false)}
        title={formatMessage('common.menuList')}
      >
        <RoutesList open={openEdit} setOpen={setEditOpen} />
      </ProModal>
    </DraggableContainer>
  );
};
export default observer(Module);
