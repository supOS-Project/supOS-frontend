import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { filter, find, isEmpty, map } from 'lodash';
import { storageOpt } from '@/utils';
import { SUPOS_USER_GUIDE_ROUTES } from '@/common-types/constans';
import { shepherd } from '@/components';
import { useTranslate } from '@/hooks';
import { useThemeContext } from '@/contexts/theme-context';
import { MenuTypeEnum } from '@/stores/theme-store';

/**
 * 使用 新人引导 步骤
 * @param steps 初始化步骤数据
 */
export const useGuideSteps = (steps: any[] = []) => {
  const themeStore = useThemeContext();
  const pathname = useLocation().pathname;
  const tour = useRef(shepherd()).current;
  const formatMessage = useTranslate();

  useEffect(() => {
    const startTour = () => {
      // 过滤出存在的步骤数据（根据元素是否存在进行判断）
      const availableSteps = filter(
        steps,
        (step) =>
          isEmpty(step.attachTo?.element) || (step.attachTo?.element && document.querySelector(step.attachTo.element))
      );
      // 如果有步骤数据
      if (availableSteps && availableSteps.length > 0) {
        if (availableSteps.length === 1 && !availableSteps[0].buttons) {
          availableSteps[0].buttons = [
            {
              action() {
                return this.complete();
              },
              text: formatMessage('global.tipDone'),
            },
          ];
        } else {
          if (!availableSteps[0].buttons) {
            availableSteps[0].buttons = [
              {
                action() {
                  return this.complete();
                },
                text: formatMessage('global.tipExit'),
                classes: 'prev-class',
              },
              {
                action() {
                  return tour.next();
                },
                text: formatMessage('global.tipNext'),
              },
            ];
          }
          if (!availableSteps[availableSteps.length - 1].buttons) {
            availableSteps[availableSteps.length - 1].buttons = [
              {
                action() {
                  return this.back();
                },
                text: formatMessage('global.tipBack'),
                classes: 'prev-class',
              },
              {
                action() {
                  return this.complete();
                },
                text: formatMessage('global.tipDone'),
              },
            ];
          }
        }
        tour.addSteps(availableSteps);
        tour.start();
        tour.on('cancel', () => {
          tour.complete();
        });
        tour.on('complete', () => {
          // 监听完成时把当前路由isVisited设置为已浏览
          const currentUserGuideRoute = storageOpt.get(SUPOS_USER_GUIDE_ROUTES);
          storageOpt.set(
            SUPOS_USER_GUIDE_ROUTES,
            map(currentUserGuideRoute, (route) =>
              route?.menu?.url === pathname ? { ...route, isVisited: true } : route
            )
          );
        });
      }
    };

    const userGuideRoute = storageOpt.get(SUPOS_USER_GUIDE_ROUTES);
    const currentRoute = find(userGuideRoute, (route) => route?.menu?.url === pathname);
    // 当前路由没有被访问过，则初始化当前路由的步骤数据
    if (currentRoute && currentRoute?.isVisited === false) {
      const menuType = themeStore.menuType;
      if (menuType !== MenuTypeEnum.Top) {
        themeStore.setMenuType(MenuTypeEnum.Top);
        setTimeout(() => {
          // 需要等菜单渲染后才能初始化数据，此时需导航指引的id才存在
          startTour();
        }, 200);
      } else {
        startTour();
      }
    }
  }, []);

  return {
    tour,
  };
};
