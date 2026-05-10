---
name: mock
description: 用于模拟API请求的技能
---

# mock 模拟API请求

## 使用场景

Vue/React/原生项目开发、接口未完成联调、单元测试、异常场景模拟。

## 实施步骤

### 1. 安装依赖包

# 安装 MSW + Mock.js（开发依赖）

```bash
npm install msw mockjs --save-dev
npx msw init public/ --save
```

### 2. 创建 MSW 配置文件

# 生成 Service Worker 文件（public 目录）

```bash
npx msw init public/ --save
```

### 3. 目录结构（标准化）

src/
├── mock/
│ ├── handlers/ # 接口规则（按模块）
│ │ ├── index.js # 统一导出
│ │ ├── user.js # 用户模块
│ │ └── common.js # 公共模块
│ ├── utils.js # 工具封装（响应+Mock.js）
│ └── browser.js # 浏览器入口（注册 Worker）
├── public/
│ └── mockServiceWorker.js # MSW 生成文件
└── main.js # 项目入口

### 4.工具封装（src/mock/utils.js）

```javascript
import Mock from 'mockjs'
const { mock, Random } = Mock

// 成功响应
export const successRes = (data = null, message = 'success') => ({
  code: 200,
  message,
  data
})

// 失败响应
export const errorRes = (message = 'error', code = 500) => ({
  code,
  message,
  data: null
})

// 生成随机用户
export const generateUser = () =>
  mock({
    'id|+1': 1,
    name: '@cname',
    'age|18-60': 25,
    phone: /^1[3-9]\d{9}$/,
    createTime: '@datetime'
  })

export { Random }
```

### 5.接口规则示例

```javascript
import { rest } from 'msw'
import { successRes, errorRes, generateUser } from '../utils'

// 模拟 10 条用户数据
const mockUsers = Array.from({ length: 10 }, () => generateUser())

export const userHandlers = [
  // GET 用户列表（支持分页+延迟）
  rest.get('/api/user/list', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page')) || 1
    const pageSize = parseInt(req.url.searchParams.get('pageSize')) || 5
    const start = (page - 1) * pageSize
    const list = mockUsers.slice(start, start + pageSize)

    return res(
      ctx.delay(800), // 模拟加载延迟
      ctx.json(successRes({ list, total: mockUsers.length }))
    )
  }),

  // GET 单个用户（动态 ID）
  rest.get('/api/user/:id', (req, res, ctx) => {
    const user = mockUsers.find(item => item.id === Number(req.params.id))
    return user ? res(ctx.json(successRes(user))) : res(ctx.json(errorRes('用户不存在', 404)))
  }),

  // POST 新增用户
  rest.post('/api/user/add', async (req, res, ctx) => {
    const newUser = await req.json()
    const user = { id: mockUsers.length + 1, ...newUser, createTime: new Date().toISOString() }
    mockUsers.push(user)
    return res(ctx.status(201), ctx.json(successRes(user, '新增成功')))
  })
```

### 6.模块统一导出（src/mock/handlers/index.js）

```javascript
import { userHandlers } from './user'
import { commonHandlers } from './common'

// 合并所有模块接口规则
export const handlers = [...userHandlers, ...commonHandlers]
```

### 7.注册 Worker（src/mock/browser.js）

```javascript
import { setupWorker } from 'msw'
import { handlers } from './handlers'

// 创建 Worker 实例
export const worker = setupWorker(...handlers)
```

### 8.项目入口集成（main.js）

```javascript
// Vue3 示例（React 替换对应入口即可）
import { createApp } from 'vue'
import App from './App.vue'

// 开发环境启用 MSW
if (import.meta.env.DEV) {
  const { worker } = await import('./mock/browser')
  worker.start({ onUnhandledRequest: 'bypass' }) // 放行未匹配请求
}

createApp(App).mount('#app')
```
