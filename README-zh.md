[English][readme-en-link] | **简体中文**

# supOS

supOS 是一个开源的工业物联网 (IIoT) 平台。

## 技术栈

- **TypeScript**: 添加静态类型的 JavaScript 超集。
- **Vite**: 一个快速的开发服务器和构建工具。
- **React**: 用于构建用户界面的 JavaScript 库。
- **pnpm**: 一个快速、节省磁盘空间的软件包管理器。

### 依赖

确保您已安装以下内容：

- [Node.js](https://nodejs.org/) (version 18 or later)
- [pnpm](https://pnpm.io) (version 8 or later)
- [vite](https://vite.dev/)

### 安装

1. 复制仓库地址:

   ```bash
   git clone https://github.com/supOS-Project/supOS-frontend.git
   ```

2. 安装依赖:

   ```bash
   pnpm install

   ```

3. 开发:
   ```bash
   pnpm start
   ```
4. 生产构建:
   ```bash
   pnpm build
   ```
5. 跳过版本

```bash
git merge release/20241106-f-iteration -m "feat: 合并 feature-branch 到 master，skip-version"
```

## 开发规范

[规范][readme-spec-link]
[导航][shepherd-link]

## 许可证

本项目采用 Apache License 2.0 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

<!-- Links -->

[readme-en-link]: ./README.md
[readme-zh-link]: ./README-zh.md
[readme-spec-link]: ./docs/dev-spec.md
[shepherd-link]: ./docs/component/shepherd.md
