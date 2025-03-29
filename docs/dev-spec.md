# 项目开发规范

## 一、命名规范

### 1. 目录命名

- 全部采用小写方式，以中划线分隔。
- 有复数结构时，采用复数写法；缩写不用复数。
- 示例：
  - `custom-nav`
  - `apis`

### 2. 文件命名

- 全部采用小写形式，以中划线分隔。
- React 组件采用大驼峰写法（除了 `index.tsx`）。
- 示例：
  - `example.ts`
  - `index.tsx`
  - `UserInfo.tsx`

### 3. 路由命名编码顺序

- 严格与页面文件命名一致。
- 多级路由嵌套不可超过三层。
- 示例：
  - `collection-flow`

### 4. 接口命名

- 使用小写形式，采用中划线分隔。

### 5. CSS命名

- 全部采用小写形式，以中划线分隔。
- 将嵌套深度限制在 3 级。
- 示例：
  - `.com-layout`

## 二、注释规范

### 1. 单行注释

```javascript
// 这是一个单行注释
const count = 1; // 计数器
```

### 2. 多行注释

```javascript
/*
 * 这是一个多行注释
 * 这是一个多行注释
 */
```

### 3. 文档注释

```javascript
/*
 * @Author: 文件作者
 * @Date: 创建时间
 * @LastEditors: 最后修改人
 * @LastEditTime: 最后修改时间
 * @FilePath: 文件路径
 * @Description: 文件描述
 */
```

## 三、React 项目规范

### 1. 文件导入顺序

```javascript
// 1. 与 React 相关的第三方包
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// 2. 其他第三方包
import lodash from 'lodash';

// 3. 组件库
// (1) antd-design
import { Button } from 'antd';
// (2) @ant-design/icons
import { SmileOutlined } from '@ant-design/icons';
// (3) 自定义组件
// ① 公共组件
import Header from '@/components/Header';
// ② 非公共组件
import UserCard from './UserCard';

// 4. 常量
// (1) 全局常量
import { GLOBAL_CONFIG } from '@/config';
// (2) 局部常量
const LOCAL_CONSTANT = 'local';

// 5. 方法
// (1) 工具方法
import { formatDate } from '@/utils';
// (2) 其他文件中的方法
import { fetchUserData } from '@/services/user';

// 6. API
import { getUserAPI } from '@/api/user';

// 7. Store
import { useUserStore } from '@/store/user';

// 8. 图片
import Logo from '@/assets/logo.png';

// 9. 样式
import '@/styles/global.css';
```

### 2. 编码顺序

```javascript
// 1. 解构 props（如果有）
const { id, name } = props;

// 2. React 相关的第三方包中的钩子函数（除了 useEffect）
const [state, setState] = useState(null);

// 3. 方法（与 API 相关的方法放最后）
const handleClick = () => {
  console.log('Button clicked');
};
const fetchData = async () => {
  const data = await getUserAPI();
  setState(data);
};

// 4. 内部组件
const RenderItem = () => <div>{name}</div>;

// 5. useEffect
// (1) 无依赖
useEffect(() => {
  console.log('Component mounted');
}, []);

// (2) 有依赖（按照调用的先后顺序排序）
useEffect(() => {
  console.log('State changed', state);
}, [state]);

// (3) 返回值是函数
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Interval running');
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

### 3. 组件规范

- 组件样式导入不能以module形式导入。
- 模块重导。

  - 参考 https://github.com/arco-design/arco-design/blob/main/components/index.tsx

  ```javascript
  // 1.直接重导出
  export { foo, bar } from './moduleA';

  // 2.重命名并重导出
  export { foo as newFoo, bar as newBar } from './moduleA';
  export { default as ModuleDDefault } from './moduleD';

  // 3.重导出整个模块（不含默认导出）
  export * from './moduleA';

  // 4.先导入再重导出
  import { foo, bar } from './moduleA';
  export { foo, bar };
  ```

- 一定要写ts，不可以使用any类型。

## 四、分支管理

### 1. 分支命名规则

- 格式：`dev/d-x-version`
  - `d`: 表示时间（一般为开发结束时间；不确认时间则为开发开始时间）
  - `x`: 表示分支版本（一般为 `p`，表示公开版）
  - `version`: 版本号
- 示例：
  - `dev/20250117-p-1.0.2`

### 2. 个人版本命名

- 在开发者+自己定义。
- 示例：
  - `zfy/20250117-p-1.0.2`

## 五、目录结构

```text
├── public                    # 静态资源目录
│   ├── locale                # 国际化语言包
│   └── logo.svg              # 项目 Logo
├── src                       # 源码目录
│   ├── App.css               # 应用主样式文件
│   ├── App.tsx               # 应用入口组件
│   ├── CookieContext.tsx     # Cookie 上下文
│   ├── apis                  # API 接口
│   ├── assets                # 静态资源
│   ├── common-types          # 公共类型定义
│   ├── components            # 公共组件
│   ├── contexts              # 上下文
│   ├── hooks                 # 自定义 Hook
│   ├── index.scss            # 全局样式文件
│   ├── layout                # 布局相关组件
│   ├── main.tsx              # 应用主入口文件
│   ├── pages                 # 页面文件夹
│   ├── routers               # 路由
│   ├── stores                # 状态管理
│   ├── theme                 # 主题配置
│   ├── types                 # 类型定义
│   ├── utils                 # 工具函数
│   └── vite-env.d.ts         # Vite 环境变量类型定义
├── stylelint.config.js       # Stylelint 配置文件
├── supos.dev.ts              # 开发环境配置
├── tsconfig.app.json         # 应用 TypeScript 配置
├── tsconfig.json             # TypeScript 配置
├── tsconfig.node.json        # Node.js TypeScript 配置
└── vite.config.ts            # Vite 配置文件
├── Dockerfile                # Docker 配置文件
├── Dockerfile-CN             # jenkins Docker 配置
├── LICENSE                   # 开源协议文件
├── README.md                 # 项目说明文档
├── commitlint.config.js      # commitlint 配置文件
├── eslint.config.js          # ESLint 配置文件
├── index.html                # 应用入口 HTML 文件
├── package.json              # 项目依赖和脚本定义
├── pnpm-lock.yaml            # pnpm 锁定文件
├── postcss.config.js         # PostCSS 配置文件
├── prettier.config.js        # Prettier 配置文件
```

## 其他

其他规范均用stylelint、eslint、husky、prettier等库去做了限制，不再列举。
