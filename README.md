**English** | [中文][readme-zh-link]

# supOS

supOS is an open-source Industrial Internet of Things (IIoT) platform.

## Tech Stack

- **TypeScript**: A superset of JavaScript that adds static types.
- **Vite**: A fast development server and build tool.
- **React**: A JavaScript library for building user interfaces.
- **pnpm**: A fast, disk space-efficient package manager.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or later)
- [pnpm](https://pnpm.io) (version 8 or later)
- [vite](https://vite.dev/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/supOS-Project/supOS-frontend.git
   ```

2. Install the dependencies:

   ```bash
   pnpm install

   ```

3. Development:
   ```bash
   pnpm start
   ```
4. Building for Production:
   ```bash
   pnpm build
   ```

## Development Specifications

[Spec][readme-spec-link]
[Shepherd][shepherd-link]

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

<!-- Links -->

[readme-en-link]: ./README.md
[readme-zh-link]: ./README-zh.md
[readme-spec-link]: ./docs/dev-spec.md
[shepherd-link]: ./docs/component/shepherd.md
