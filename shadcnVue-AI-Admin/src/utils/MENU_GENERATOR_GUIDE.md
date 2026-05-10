# 路由菜单生成系统

## 📋 概述

本系统实现了**从 Vue Router 配置自动生成侧边栏菜单**的功能，无需手动维护菜单数据。

## 🎯 核心文件

| 文件 | 作用 |
|------|------|
| `src/utils/menuGenerator.ts` | 路由到菜单的转换工具函数 |
| `src/layouts/Sidebar.vue` | 侧边栏组件（使用动态菜单） |
| `src/router/modules/*.ts` | 各模块的路由配置 |

## 🔧 工作原理

### 1. 路由配置 → 菜单生成流程

```
router/modules/*.ts (路由配置)
        ↓
  menuGenerator.ts (转换函数)
        ↓
  Sidebar.vue (动态渲染)
        ↓
  用户看到的侧边栏菜单
```

### 2. 自动过滤规则

以下路由**不会**出现在菜单中：

- ✅ `meta.hidden === true` 的路由
- ✅ 没有 `meta.title` 的路由
- ✅ 空路径且不是根路由的路由

## 📝 路由 Meta 配置指南

### 基础配置（必填）

```typescript
{
  path: '/example',
  name: 'Example',
  component: () => import('@/views/Example.vue'),
  meta: {
    title: '示例页面', // ⭐ 必填：菜单显示的标题
    icon: 'Layout',    // 可选：Lucide 图标名称
  }
}
```

### 完整配置（推荐）

```typescript
{
  path: '/system/users',
  name: 'UserManagement',
  component: () => import('@/views/system/UserManagement.vue'),
  meta: {
    // ==================== 菜单相关 ====================
    title: '用户管理',           // 菜单标题（必填）
    icon: 'Users',              // Lucide 图标名称
    description: '管理系统用户', // 鼠标悬停提示文本

    // ==================== 权限控制 ====================
    permission: 'system:user:list', // 权限标识（配合 v-perm 指令）

    // ==================== 显示控制 ====================
    hidden: false,            // 是否在菜单中隐藏（true = 隐藏）
    requiresAuth: true,       // 是否需要认证

    // ==================== 其他元信息 ====================
    breadcrumb: ['系统管理', '用户管理'], // 面包屑
    activeMenu: '/system/users',          // 高亮的菜单路径
    affix: true,                         // 是否固定标签页
    noCache: true,                       // 不缓存页面
  }
}
```

### 嵌套菜单（子菜单）

```typescript
// 父级路由（分组标题）
{
  path: '/components',
  meta: {
    title: '组件演示',     // 分组标题
    icon: 'Component',    // 分组图标
  },
  children: [
    // 子菜单项
    {
      path: '/components/tree/basic',
      name: 'TreeBasicDemo',
      component: () => import('@/views/components/tree/TreeBasicDemo.vue'),
      meta: {
        title: 'Tree 基础功能',   // 显示为子菜单
        icon: 'TreePine',
      }
    },
    {
      path: '/components/tree/drag',
      name: 'TreeDragDemo',
      component: () => import('@/views/components/tree/TreeDragDemo.vue'),
      meta: {
        title: 'Tree 拖拽功能',   // 显示为子菜单
        icon: 'GripVertical',
      }
    }
  ]
}
```

**效果**：
```
📦 组件演示
  ├── 🌲 Tree 基础功能
  └── ✋ Tree 拖拽功能
```

## 🎨 菜单项类型定义

```typescript
interface MenuItem {
  path: string           // 路由路径
  name: string           // 路由名称
  title: string          // 菜单标题
  icon?: string          // 图标名称（Lucide Icons）
  permission?: string    // 权限标识
  description?: string   // 描述/提示文本
  hidden?: boolean       // 是否隐藏
  children?: MenuItem[]  // 子菜单项
}
```

## 🚀 快速开始

### 步骤1：添加新路由模块

```typescript
// src/router/modules/article.ts
import type { RouteRecordRaw } from 'vue-router'

const articleRoutes: RouteRecordRaw[] = [
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('@/views/article/List.vue'),
    meta: {
      title: '文章管理',         // ← 必填！
      icon: 'FileText',          // ← 推荐
      permission: 'article:list' // ← 可选
    }
  }
]

export default articleRoutes
```

### 步骤2：导入到主路由

```typescript
// src/router/index.ts
import articleRoutes from './modules/article'

// 在 Layout 的 children 中添加
children: [
  ...dashboardRoutes,
  ...userRoutes,
  ...articleRoutes,  // ← 新增
]
```

### 步骤3：自动生效！

刷新页面后，侧边栏会自动显示"文章管理"菜单项。

## 💡 高级用法

### 1. 隐藏某些路由

```typescript
// 编辑详情页（不显示在菜单中）
{
  path: '/articles/:id/edit',
  name: 'ArticleEdit',
  component: () => import('@/views/article/Edit.vue'),
  meta: {
    hidden: true,  // ← 隐藏此路由
  }
}
```

### 2. 外部链接

```typescript
{
  path: '/external-docs',
  meta: {
    title: '官方文档',
    icon: 'ExternalLink',
    externalUrl: 'https://example.com/docs'
  }
}
```

> **注意**: 需要在 Sidebar 中处理 `externalUrl` 的情况

### 3. 动态权限菜单

结合 `v-perm` 指令实现权限控制：

```typescript
{
  path: '/admin/settings',
  meta: {
    title: '系统设置',
    icon: 'Settings',
    permission: 'admin:settings:view' // 需要此权限才能看到
  }
}
```

Sidebar 中已集成：
```vue
<router-link v-perm="item.permission || ''" :to="item.path">
  ...
</router-link>
```

### 4. 图标选择器

支持所有 [Lucide Icons](https://lucide.dev/icons/)：

常用图标：
- 导航类：`LayoutDashboard`, `Users`, `Settings`, `FileText`
- 操作类：`Plus`, `Edit`, `Trash2`, `Search`
- 状态类：`CheckCircle`, `AlertCircle`, `XCircle`
- 组件类：`TreePine`, `Table`, `FormInput`

## 🐛 常见问题

### Q1: 为什么我的路由没有显示在菜单中？

检查清单：
- [ ] 是否设置了 `meta.title`？
- [ ] 是否不小心设置了 `hidden: true`？
- [ ] 路由是否在 Layout 的 `children` 数组中？

### Q2: 如何调整菜单顺序？

调整 `src/router/index.ts` 中 `children` 数组的顺序即可。

### Q3: 如何添加菜单分组？

使用嵌套路由结构（参考上面的"嵌套菜单"示例）。

### Q4: 如何自定义菜单样式？

修改 `src/layouts/Sidebar.vue` 中的模板和样式。

## 📊 对比：改造前后

| 项目 | 改造前 | 改造后 |
|------|--------|--------|
| **菜单维护** | 手动编辑 Sidebar.vue | 只需修改路由配置 |
| **代码位置** | 分散在多个地方 |集中在 router/modules/ |
| **一致性** | 容易出错 | 路由与菜单自动同步 |
| **可扩展性** | 困难 | 添加路由即自动显示 |
| **团队协作** | 冲突频繁 | 各自负责自己的模块 |

## 🔗 相关文件

- [menuGenerator.ts](../utils/menuGenerator.ts) - 核心转换逻辑
- [Sidebar.vue](../layouts/Sidebar.vue) - 侧边栏组件
- [Router Index](../router/index.ts) - 主路由配置
- [Route Modules](../router/modules/) - 各模块路由

---

**最后更新**: 2026-05-10
