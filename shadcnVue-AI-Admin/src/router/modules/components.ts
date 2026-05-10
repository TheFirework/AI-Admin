import type { RouteRecordRaw } from 'vue-router'

// ==================== 组件演示模块路由 ====================
//
// 【三层结构】
// 第一层：/components          → 组件演示（总目录）
// 第二层：/components/tree     → Tree 组件（子分类）
// 第三层：/components/tree/*   → 具体演示页面
//
const componentsRoutes: RouteRecordRaw[] = [
  {
    path: '/components',
    name: 'ComponentsDemo',
    meta: {
      title: '组件演示',
      icon: 'Component',
      description: 'UI 组件库功能演示',
      requiresAuth: true
    },
    children: [
      // ==================== 第二层：Tree 组件分类 ====================
      {
        path: '/components/tree',
        name: 'TreeComponents',
        redirect: '/components/tree/basic', // 默认重定向到基础功能页
        meta: {
          title: 'Tree 组件',
          icon: 'TreePine',
          description: '树形控件的各种用法和场景演示'
        },
        children: [
          // ==================== 第三层：具体演示页面 ====================

          // 基础功能演示
          {
            path: '/components/tree/basic',
            name: 'TreeBasicDemo',
            component: () => import('@/views/components/tree/TreeBasicDemo.vue'),
            meta: {
              title: '基础功能',
              icon: 'LayoutList',
              description: '展示 Tree 组件的基础功能：复选框、展开/折叠、手风琴模式、图标显示等',
              requiresAuth: true
            }
          },

          // 拖拽功能演示
          {
            path: '/components/tree/drag',
            name: 'TreeDragDemo',
            component: () => import('@/views/components/tree/TreeDragDemo.vue'),
            meta: {
              title: '拖拽功能',
              icon: 'GripVertical',
              description: '展示 Tree 组件的拖拽场景：禁用、锁定、权限控制、双模式系统等',
              requiresAuth: true
            }
          },

          // 高级功能演示
          {
            path: '/components/tree/advanced',
            name: 'TreeAdvancedDemo',
            component: () => import('@/views/components/tree/TreeAdvancedDemo.vue'),
            meta: {
              title: '高级功能',
              icon: 'Zap',
              description: '展示 Tree 组件的高级功能：虚拟滚动、节点过滤、懒加载、事件系统、对外方法调用等',
              requiresAuth: true
            }
          }
        ]
      }
    ]
  }
]

export default componentsRoutes
