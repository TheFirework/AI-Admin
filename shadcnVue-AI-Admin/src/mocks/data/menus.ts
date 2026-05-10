import type { MenuItem } from '@/api/modules/menu'

export const menuData: MenuItem[] = [
  {
    id: '1',
    name: '系统管理',
    parentId: null,
    visible: true,
    icon: 'settings',
    type: 'menu',
    routePath: '/system',
    keepAlive: false,
    filePath: '@/views/system/index.vue',
    permission: 'system:manage',
    updateTime: '2024-01-15 10:30:00',
    sort: 1,
    children: [
      {
        id: '1-1',
        name: '用户管理',
        parentId: '1',
        visible: true,
        icon: 'users',
        type: 'page',
        routePath: '/system/users',
        keepAlive: true,
        filePath: '@/views/system/users/index.vue',
        permission: 'system:users',
        updateTime: '2024-01-15 10:35:00',
        sort: 1,
        children: [
          {
            id: '1-1-1',
            name: '新增用户',
            parentId: '1-1',
            visible: false,
            icon: 'plus',
            type: 'button',
            routePath: '',
            keepAlive: false,
            filePath: '',
            permission: 'system:users:create',
            updateTime: '2024-01-15 10:36:00',
            sort: 1
          },
          {
            id: '1-1-2',
            name: '编辑用户',
            parentId: '1-1',
            visible: false,
            icon: 'edit',
            type: 'button',
            routePath: '',
            keepAlive: false,
            filePath: '',
            permission: 'system:users:edit',
            updateTime: '2024-01-15 10:37:00',
            sort: 2
          },
          {
            id: '1-1-3',
            name: '删除用户',
            parentId: '1-1',
            visible: false,
            icon: 'trash-2',
            type: 'button',
            routePath: '',
            keepAlive: false,
            filePath: '',
            permission: 'system:users:delete',
            updateTime: '2024-01-15 10:38:00',
            sort: 3
          }
        ]
      },
      {
        id: '1-2',
        name: '角色管理',
        parentId: '1',
        visible: true,
        icon: 'shield',
        type: 'page',
        routePath: '/system/roles',
        keepAlive: true,
        filePath: '@/views/system/roles/index.vue',
        permission: 'system:roles',
        updateTime: '2024-01-15 10:40:00',
        sort: 2
      },
      {
        id: '1-3',
        name: '菜单管理',
        parentId: '1',
        visible: true,
        icon: 'menu',
        type: 'page',
        routePath: '/system/menus',
        keepAlive: false,
        filePath: '@/views/system/menus/index.vue',
        permission: 'system:menus',
        updateTime: '2024-01-15 10:45:00',
        sort: 3
      }
    ]
  },
  {
    id: '2',
    name: '数据统计',
    parentId: null,
    visible: true,
    icon: 'bar-chart-2',
    type: 'menu',
    routePath: '/statistics',
    keepAlive: false,
    filePath: '@/views/statistics/index.vue',
    permission: 'statistics:manage',
    updateTime: '2024-01-15 11:00:00',
    sort: 2,
    children: [
      {
        id: '2-1',
        name: '销售统计',
        parentId: '2',
        visible: true,
        icon: 'trending-up',
        type: 'page',
        routePath: '/statistics/sales',
        keepAlive: true,
        filePath: '@/views/statistics/sales/index.vue',
        permission: 'statistics:sales',
        updateTime: '2024-01-15 11:05:00',
        sort: 1
      },
      {
        id: '2-2',
        name: '用户统计',
        parentId: '2',
        visible: true,
        icon: 'users',
        type: 'page',
        routePath: '/statistics/users',
        keepAlive: true,
        filePath: '@/views/statistics/users/index.vue',
        permission: 'statistics:users',
        updateTime: '2024-01-15 11:10:00',
        sort: 2
      }
    ]
  },
  {
    id: '3',
    name: '日志管理',
    parentId: null,
    visible: true,
    icon: 'file-text',
    type: 'menu',
    routePath: '/logs',
    keepAlive: false,
    filePath: '@/views/logs/index.vue',
    permission: 'logs:manage',
    updateTime: '2024-01-15 11:15:00',
    sort: 3,
    children: [
      {
        id: '3-1',
        name: '操作日志',
        parentId: '3',
        visible: true,
        icon: 'clock',
        type: 'page',
        routePath: '/logs/operation',
        keepAlive: false,
        filePath: '@/views/logs/operation/index.vue',
        permission: 'logs:operation',
        updateTime: '2024-01-15 11:20:00',
        sort: 1
      },
      {
        id: '3-2',
        name: '系统日志',
        parentId: '3',
        visible: true,
        icon: 'alert-circle',
        type: 'page',
        routePath: '/logs/system',
        keepAlive: false,
        filePath: '@/views/logs/system/index.vue',
        permission: 'logs:system',
        updateTime: '2024-01-15 11:25:00',
        sort: 2
      }
    ]
  }
]
