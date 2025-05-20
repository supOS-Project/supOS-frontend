import { useMemo } from 'react';
import { Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRoutesContext } from '@/contexts/routes-context';
import { find, map } from 'lodash';
import { storageOpt } from '@/utils';
import { SUPOS_USER_GUIDE_ROUTES } from '@/common-types/constans';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslate } from '@/hooks';
import { useTabsContext } from '@/contexts/tabs-context';
import { observer } from 'mobx-react-lite';
import { ItemType } from 'antd/es/menu/interface';

const HelpNav = () => {
  const navigate = useNavigate();
  const { TabsContext } = useTabsContext();
  const routesStore = useRoutesContext();
  const userRoute = routesStore.pickedRoutes;
  const formatMessage = useTranslate();
  const unsRoutePath = '/uns';

  const dropdownItems = useMemo(() => {
    // const guideGroupChildren = [
    //   // {
    //   //   key: '/home',
    //   // },
    //   {
    //     key: '/uns',
    //   },
    //   {
    //     key: '/collection-flow',
    //   },
    // ];
    const groupChildren: ItemType[] = [];
    // guideGroupChildren.forEach((item) => {
    //   const route = find(userRoute, (route) => route?.menu?.url === item.key && route?.menu?.picked);
    //   if (route) {
    //     groupChildren.push({ ...item, label: route.showName });
    //   }
    // });

    const route = find(userRoute, (route) => route?.menu?.url === unsRoutePath && route?.menu?.picked);
    if (route) {
      groupChildren.push(
        ...[
          { key: 'uns_step1', label: formatMessage('global.userGuideLabel1', 'Data Modeling') },
          { key: 'uns_step2', label: formatMessage('global.userGuideLabel2', 'Data Connection') },
        ]
      );
    }
    const items: ItemType[] = [
      {
        key: 'tips',
        label: formatMessage('global.userTips', 'Tips'),
      },
    ];

    if (groupChildren.length > 0) {
      const guideGroup: ItemType[] = [
        {
          type: 'divider',
        },
        {
          key: 'guideGroup',
          type: 'group',
          label: (
            <span style={{ color: 'var(--supos-select-d-color)' }}>
              {formatMessage('global.userGuide', 'Beginner’s Guide')}
            </span>
          ),
          children: groupChildren,
        },
      ];
      items.push(...guideGroup);
    }

    return items;
  }, [userRoute]);

  const handleUserGuide = ({ key }: any) => {
    if (key === 'tips') {
      routesStore.setUserTipsEnable('1');
    } else {
      let currentUserGuideRoute = storageOpt.get(SUPOS_USER_GUIDE_ROUTES);
      if (!currentUserGuideRoute) {
        currentUserGuideRoute = userRoute;
      }
      storageOpt.set(
        SUPOS_USER_GUIDE_ROUTES,
        map(currentUserGuideRoute, (route) =>
          route?.menu?.url === unsRoutePath ? { ...route, isVisited: false } : route
        )
      );
      navigate(unsRoutePath, { state: { stepId: key } });
      TabsContext?.current?.onRefreshTab?.(unsRoutePath);
    }
  };

  return (
    <Dropdown
      arrow
      placement="bottom"
      trigger={['hover', 'click']}
      overlayStyle={{ zIndex: 10000 }}
      menu={{
        items: dropdownItems,
        onClick: handleUserGuide,
      }}
    >
      <QuestionCircleOutlined
        style={{
          color: 'var(--supos-text-color)',
          fontSize: '16px',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
        }}
      />
    </Dropdown>
  );
};
export default observer(HelpNav);
