---
name: Shadcn-Vue-admin
description: 构建并维护 shadcn-vue-admin Vue 3 + Vite + TypeScript 管理仪表盘，使用 shadcn-vue、Tailwind、Pinia、Vue Router、axios 查询。用于UI/布局更改、页面添加、路由更新、主题/认证工作以及组件集成。
---

# 目标与范围

维护这个Vue 3管理仪表板仓库：页面和布局、组件集成、路由/认证、主题化、数据表和表单验证。

## Codebase map

- 应用入口：`src/main.ts`，`src/App.vue`
- 路由：`src/router/`
- 布局和页面：`src/layouts/`，`src/views/`
- 组件：`src/components/`（包括shadcn-vue样式用户界面）
- 状态：`src/stores/`
- 可组合组件：`src/composables/`
- 工具和常量：`src/utils/`、`src/lib/`、`src/constants/`
- API和请求库：`src/modules/`, `src/modules/request/`
- 静态资源：`src/assets/`
- 配置文件：`src/config/`
- 指令：`src/directives/`
- hooks：`src/hooks/`
- 初始化：`src/init/`
- lib：`src/lib/`
- mock：`src/mocks/`
- 工具：`src/utils/`

## References

- 系统知识图谱: [references/SYSTEM_KNOWLEDGE_MAP.md](references/SYSTEM_KNOWLEDGE_MAP.md)

## Commands

- Dev server: `pnpm run dev`
- Build: `pnpm run build`

## 设计与实现约定

- 使用TypeScript配合Vue 3的Composition API。
- 更倾向于使用vee-validate和zod进行表单验证。

## 常见任务指南

### Add a page

1. 在`src/views/`目录下创建一个页面组件。
2. 如果需要，通过`src/router/`注册路由/菜单。
3. 使用现有的布局和共享组件，以确保间距和排版的一致性。
4. 创建页面接口对应的mock数据。

### Add a component

1. 首先重用`src/components/ui/`和现有的shadcn-vue组件。
2. 如果需要共享，请将其放置在`src/components/`目录下，以避免页面级重复。

### Update theme/styles

1. 推荐将 Tailwind 和主题文件放在 `src/assets/` 目录中。
2. 避免过多的内联样式；保持组件的可维护性。

### Output requirements

更改后，请提供简明摘要，并列出所有运行的命令（如果有）。
