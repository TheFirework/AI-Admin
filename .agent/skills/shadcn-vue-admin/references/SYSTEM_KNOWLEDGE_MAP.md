# System Knowledge Map (for agents)

## 项目概述

- 技术栈：Vue 3 + Vite + TypeScript + TailwindCSS + shadcn-vue
- 路由：`vue-router`
- 状态：Pinia
- API：axios
- 表单：vee-validate + zod
- 用户界面：shadcn-vue / reka-ui / @lucide/vue / vue-sonner

## 路由与布局

- 路由配置：`src/router/index.ts`
- 路由守卫：`src/router/guard/*`
- 布局组件：`src/layouts/*.vue`
- 页面组件：`src/views/*.vue`

## State

- Stores: `src/stores/*` (`auth.ts`, `theme.ts`)

## 主要约定

- 路由基于文件：请勿手动编辑路由表；在`src/views/**`目录下添加/重命名/删除页面。
- 优先使用`@/`（`src/`的别名）导入，以避免脆弱的相对路径。
