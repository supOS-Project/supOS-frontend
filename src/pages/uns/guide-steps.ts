import I18nStore from '@/stores/i18n-store';
import { Step, StepOptions } from 'shepherd.js';
import { find } from 'lodash';
import { storageOpt } from '@/utils';
import { SUPOS_USER_GUIDE_ROUTES } from '@/common-types/constans';
import guideVideo from '@/assets/guide/uns_guide.mp4';

// 新手导航步骤
export const guideSteps: (navigate: any) => Array<StepOptions> | Array<Step> = (navigate: any) => {
  let hasNamespaceRoute = false;
  const userGuideRoute = storageOpt.get(SUPOS_USER_GUIDE_ROUTES);
  const currentRoute = find(userGuideRoute, (route) => route?.menu?.url === '/collection-flow' && route?.menu?.picked);
  if (currentRoute && currentRoute?.isVisited === false) {
    hasNamespaceRoute = true;
  }
  const buttons: any = [
    {
      action() {
        if (hasNamespaceRoute) {
          navigate('/collection-flow');
        }
        return this.complete();
      },
      text: hasNamespaceRoute ? I18nStore.getIntl('global.tipNext') : I18nStore.getIntl('global.tipDone'),
    },
  ];
  if (hasNamespaceRoute) {
    buttons.unshift({
      action() {
        return this.complete();
      },
      text: I18nStore.getIntl('global.tipExit'),
      classes: 'prev-class',
    });
  }
  return [
    {
      id: 'uns',
      cancelIcon: {
        enabled: false,
      },
      classes: 'guide-video-classes no-attach',
      text: `
        <div class="video-title">${I18nStore.getIntl('uns.guideVideo1Title')}</div>
        <div class="video-info">${I18nStore.getIntl('uns.guideVideo1Info')}</div>
        <video class="guide-video" autoplay muted loop controls>
          <source src="${guideVideo}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        `,
      attachTo: undefined,
      buttons: buttons,
    },
  ];
};
