# 使用指南

## 一、使用介绍

官方文档：https://docs.shepherdjs.dev/api/tour/classes/tour/

- 注意：在下一步等中使用tour.addStep(step)时，需判断需添加的步骤是否存在，避免上一步后再触发下一步时产生重复数据

```javascript
import { shepherd } from '@/components/shepherd';
// ...

// 生成导航实例
const tour = useRef(shepherd()).current;

// step具体配置项参考index.ts defaultConfig.defaultStepOptions，均可自定义覆盖默认配置
const steps = [{
    id: 'step1',
    title: "title001",
    text: "test text",
    attachTo: {
      element: '#element_id', // element 选择器为空，一般会居中展示该步骤
      on: 'bottom',
    }
    // buttons可自定义来覆盖默认配置
    buttons:[{
        action() {
          return tour.back();
        },
        text: 'Back',
    },{
        action() {
          // tour.addStep(step); 也可在步骤中动态添加或删除步骤进行调整等
          return tour.complete();
        },
        text: 'Done',
    }]
}];
tour.addSteps(steps);
tour.start();
tour.on('cancel', () => {
  // 监听取消事件
  // ...
});
tour.on('complete', () => {
  // 监听完成时事件
  // ...
});
```

## 二、已使用例子

### 1. useGuideSteps 使用Guide进行定位导航（新手导航）

- 注意点：
  - 对`element: ''`展示为居中展示
  - 会过滤掉`element: '#element_id'`还不存在的步骤，避免出现异常展示
  - 不存在buttons的step会根据步骤顺序动态添加buttons(上一步、下一步、完成、退出等)
- 参数：
  - `steps` 初始化步骤数据
- 示例：
  - `/pages/home/index.ts`

```javascript
useGuideSteps([
  {
    id: 'homepage',
    title: I18nStore.getIntl('home.guide1Title'),
    classes: 'guide-home-classes', // 单独对当前步骤设置样式
    // 可在text中使用html
    text: `
    <ul class="user-guide-list">
      <li>${I18nStore.getIntl('home.guide1Text1')}</li>
      <li>${I18nStore.getIntl('home.guide1Text2')}</li>
    </ul>
    `,
    attachTo: {
      element: '',
      on: 'auto',
    },
  },
]);
```

### 2. useTips 目前用于登录后tips功能展示

- 注意点：
  - 每次使用会打乱tips顺序，为了每次用户登录进来能随机看到tips功能点
  - 对`element: ''`展示为居中展示
  - 不存在buttons的tip会根据步骤顺序动态添加buttons(上一步、下一步、完成、退出等)
  - 当和新手导航useGuideSteps触发产生冲突时，优先展示新手导航，tips默认不展示
- 参数：
  - `originTips` 初始化步骤数据
- 示例：
  - `/layout/index.ts`

```javascript
useTips([
  {
    id: 'tip1',
    classes: 'tips-guide-classes',
    title: I18nStore.getIntl('common.welcome),
    text: `
      <div class="tips-info">${I18nStore.getIntl('global.tipInfo')}</div>
      <div class="tips-card">
        <span class="tips-card-icon-wrap"><i class="tips-card-icon card-icon-1"></i></span>
        <p class="tips-card-content">${I18nStore.getIntl('global.tip1Text1')}</p>
      </div>
      `,
    attachTo: {
      element: '',
      on: 'auto',
    },
  },
]);
```
