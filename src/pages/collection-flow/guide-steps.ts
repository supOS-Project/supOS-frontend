import I18nStore from '@/stores/i18n-store';
import { Step, StepOptions } from 'shepherd.js';
import guideVideo from '@/assets/guide/sourceflow_guide.mp4';

// 新手导航步骤
export const guideSteps: () => Array<StepOptions> | Array<Step> = () => [
  {
    id: 'collection-flow',
    cancelIcon: {
      enabled: false,
    },
    classes: 'guide-video-classes no-attach',
    text: `
        <div class="video-title">${I18nStore.getIntl('uns.guideVideo2Title')}</div>
        <div class="video-info">${I18nStore.getIntl('uns.guideVideo2Info')}</div>
        <video class="guide-video" autoplay muted loop>
          <source src="${guideVideo}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        `,
    attachTo: undefined,
    buttons: [
      {
        action() {
          return this.complete();
        },
        text: I18nStore.getIntl('global.tipDone'),
      },
    ],
  },
];
