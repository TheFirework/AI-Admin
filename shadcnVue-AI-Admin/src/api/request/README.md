# Request 模块文档

## 一、设计架构

### 1.1 架构概述

Request 模块采用**洋葱模型（Onion）**设计模式，基于 Axios 封装，实现了可扩展的中间件机制。

```
┌─────────────────────────────────────────────────────────────┐
│                      Request 入口层                         │
│   (get/post/put/delete/upload/download 等便捷方法)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Core 核心层                          │
│   (洋葱中间件执行引擎 + Axios 实例封装)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Onion 中间件层（洋葱模型）                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Global     │→│  Middleware │→│   Core      │         │
│  │  Middleware │  │   Layer    │  │ Middleware  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│        ↓                                           ↓        │
│     认证处理                                     响应处理   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Axios 底层                            │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心组件职责

| 组件              | 职责                             | 文件位置           |
| ----------------- | -------------------------------- | ------------------ |
| **Request**       | 对外统一 API，提供便捷方法       | `request.ts`       |
| **Core**          | 核心请求引擎，管理中间件和 Axios | `core.ts`          |
| **Onion**         | 洋葱中间件执行器                 | `onion.ts`         |
| **Types**         | TypeScript 类型定义              | `types.ts`         |
| **Toast Utils**   | 全局提示工具函数                 | `utils/toast.ts`   |
| **Loading Utils** | 全局加载状态管理                 | `utils/loading.ts` |

---

## 二、目录结构

```
src/api/request/
├── core.ts              # 核心请求类，封装 Axios 和中间件引擎
├── request.ts           # 对外 API 入口，提供便捷方法
├── onion.ts             # 洋葱中间件执行模型
├── types.ts             # 类型定义（RequestConfig, RequestOptions 等）
├── urls.ts              # API 地址配置
├── utils/               # 工具函数目录
│   ├── toast.ts         # Toast 提示工具函数
│   └── loading.ts       # Loading 加载状态管理
├── middlewares/         # 中间件目录
│   ├── index.ts         # 中间件导出
│   ├── auth.ts          # 认证中间件（自动添加 Token）
│   ├── loading.ts       # 加载状态中间件
│   ├── errorHandler.ts  # 错误处理中间件（含 Toast 提示）
│   ├── responseHandler.ts # 响应处理中间件（含 Toast 提示）
│   ├── getParams.ts     # 请求参数处理中间件
│   ├── retry.ts         # 请求重试中间件
│   ├── validate.ts      # 请求验证中间件
│   └── repeatSubmit.ts  # 重复提交拦截中间件
├── adapters/            # UI 适配层
│   ├── index.ts         # 适配层导出
│   ├── types.ts         # 适配层类型定义
│   └── UIAdapter.ts     # Toast/Loading 适配层实现
└── extensions/          # 扩展模块
    └── logging/         # 日志扩展
        ├── index.ts
        ├── config.ts
        ├── logging.ts
        └── middleware.ts
```

---

## 三、核心功能

### 3.1 请求方法

| 方法                                 | 功能        | 参数                    | 返回值          |
| ------------------------------------ | ----------- | ----------------------- | --------------- |
| `request<T>(options)`                | 通用请求    | `RequestOptions`        | `Promise<T>`    |
| `get<T>(url, options?)`              | GET 请求    | url, 可选配置           | `Promise<T>`    |
| `post<T>(url, data?, options?)`      | POST 请求   | url, 数据, 可选配置     | `Promise<T>`    |
| `put<T>(url, data?, options?)`       | PUT 请求    | url, 数据, 可选配置     | `Promise<T>`    |
| `delete<T>(url, options?)`           | DELETE 请求 | url, 可选配置           | `Promise<T>`    |
| `upload<T>(url, formData, options?)` | 文件上传    | url, FormData, 可选配置 | `Promise<T>`    |
| `download(url, options?)`            | 文件下载    | url, 可选配置           | `Promise<Blob>` |

### 3.2 中间件体系

| 中间件                      | 执行阶段         | 功能说明                      |
| --------------------------- | ---------------- | ----------------------------- |
| `authMiddleware`            | 请求前（Global） | 自动添加 Authorization 请求头 |
| `loadingMiddleware`         | 请求前后         | 全局 Loading 状态管理         |
| `validateMiddleware`        | 请求前           | 参数校验                      |
| `loggingMiddleware`         | 请求前后         | 请求日志记录                  |
| `retryMiddleware`           | 请求失败时       | 自动重试（502/503/504）       |
| `repeatSubmitMiddleware`    | 请求前           | 防止重复提交                  |
| `getParamsMiddleware`       | 请求前           | 参数处理                      |
| `errorHandlerMiddleware`    | 异常时           | 统一错误处理（含 Toast 提示） |
| `responseHandlerMiddleware` | 响应后           | 统一响应处理（含 Toast 提示） |

### 3.3 中间件执行顺序

```
请求发起
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Global Middlewares (全局中间件 - 最先执行)                 │
│  └─ authMiddleware (认证处理)                               │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Middlewares (业务中间件 - 按注册顺序)                       │
│  ├─ loadingMiddleware (加载状态管理)                        │
│  ├─ validateMiddleware (参数校验)                          │
│  ├─ loggingMiddleware (日志记录)                           │
│  ├─ retryMiddleware (重试处理)                             │
│  ├─ repeatSubmitMiddleware (防重复提交)                    │
│  ├─ getParamsMiddleware (参数处理)                         │
│  ├─ errorHandlerMiddleware (错误处理 + Toast)              │
│  └─ responseHandlerMiddleware (响应处理 + Toast)           │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│  Core Middlewares (核心中间件 - 最后执行)                   │
│  ├─ 默认配置合并                                           │
│  └─ 异常捕获                                               │
└─────────────────────────────────────────────────────────────┘
    ↓
实际 Axios 请求
```

### 3.4 Toast 配置控制

系统支持异常返回时的 Toast 提示功能，默认全局开启（开发/测试环境），支持单个请求控制。

**Toast 配置选项：**

| 配置项      | 类型                                          | 默认值               | 说明                           |
| ----------- | --------------------------------------------- | -------------------- | ------------------------------ |
| `toast`     | `boolean \| ToastConfig`                      | `true`（非生产环境） | 是否显示 Toast 提示            |
| `type`      | `'success' \| 'warning' \| 'error' \| 'info'` | `'error'`            | 提示类型                       |
| `message`   | `string`                                      | 响应中的 message     | 提示文本                       |
| `duration`  | `number`                                      | `3000`               | 显示时长（毫秒）               |
| `showClose` | `boolean`                                     | `true`               | 是否显示关闭按钮               |
| `component` | `'message' \| 'modal' \| 'notification'`      | `'message'`          | 提示组件类型                   |
| `title`     | `string`                                      | 根据类型自动生成     | 提示标题（Modal/Notification） |

**Toast 组件类型说明：**

| 组件类型       | 说明                     | 适用场景                    |
| -------------- | ------------------------ | --------------------------- |
| `message`      | 轻量级消息提示，自动消失 | 操作成功/失败提示、简短通知 |
| `modal`        | 模态对话框，需用户确认   | 重要操作确认、错误详情展示  |
| `notification` | 通知提醒，右上角弹出     | 系统通知、异步操作结果      |

**Toast 启用规则：**

| 配置值                     | 行为                                            |
| -------------------------- | ----------------------------------------------- |
| `toast: false`             | 强制禁用 Toast                                  |
| `toast: true`              | 强制启用 Toast（使用默认配置）                  |
| `toast: { type: 'error' }` | 启用并自定义配置                                |
| 未设置 `toast`             | 全局配置控制（开发/测试环境启用，生产环境禁用） |

### 3.5 Loading 配置控制

系统支持全局请求 Loading 状态管理，默认全局开启，支持单个请求控制。

**Loading 配置选项：**

| 配置项       | 类型                       | 默认值 | 说明                           |
| ------------ | -------------------------- | ------ | ------------------------------ |
| `loading`    | `boolean \| LoadingConfig` | `true` | 是否显示 Loading               |
| `enabled`    | `boolean`                  | `true` | 是否启用 Loading               |
| `delay`      | `number`                   | `0`    | 延迟显示时间（毫秒），避免闪烁 |
| `target`     | `string \| HTMLElement`    | -      | 指定加载目标容器               |
| `fullscreen` | `boolean`                  | `true` | 是否全屏显示                   |

**Loading 启用规则：**

| 配置值                    | 行为                             |
| ------------------------- | -------------------------------- |
| `loading: false`          | 强制禁用 Loading                 |
| `loading: true`           | 强制启用 Loading（使用默认配置） |
| `loading: { delay: 500 }` | 启用并自定义配置                 |
| 未设置 `loading`          | 使用全局配置（默认启用）         |

**Loading 计数机制：**

- 支持并发请求计数，只有当所有请求完成后才关闭 Loading
- 避免多个请求导致 Loading 频繁显示/关闭

---

## 四、类型定义

### 4.1 RequestOptions（请求选项）

```typescript
interface RequestOptions {
  url: string // 请求地址（必填）
  method?: Method // HTTP 方法（默认 get）
  data?: any // 请求体数据
  params?: Record<string, any> // URL 查询参数
  headers?: Record<string, string> // 请求头
  cancelToken?: any // 取消令牌
  preventRepeat?: boolean // 是否防止重复提交
  responseType?: ResponseType // 响应类型
  returnOriginal?: boolean // 是否返回原始响应（默认返回 data）
  retry?: boolean // 是否启用重试
  retryCount?: number // 重试次数（默认 3）
  retryDelay?: number // 重试延迟（毫秒，默认 1000）
  retryStatusCodes?: number[] // 需要重试的状态码（默认 [502,503,504]）
  toast?: boolean | ToastConfig // Toast 提示配置
  loading?: boolean | LoadingConfig // Loading 加载配置
}
```

### 4.2 ToastConfig（Toast 配置）

```typescript
type ToastType = 'success' | 'warning' | 'error' | 'info'

type ToastComponentType = 'message' | 'modal' | 'notification'

interface ToastConfig {
  type?: ToastType // 提示类型
  message?: string // 提示文本
  duration?: number // 显示时长（毫秒）
  showClose?: boolean // 是否显示关闭按钮
  component?: ToastComponentType // 提示组件类型（默认 message）
  title?: string // 提示标题（Modal/Notification 使用）
}
```

### 4.3 LoadingConfig（Loading 配置）

```typescript
interface LoadingConfig {
  enabled?: boolean // 是否启用
  delay?: number // 延迟显示时间（毫秒）
  target?: string | HTMLElement // 加载目标容器
  fullscreen?: boolean // 是否全屏显示
}
```

### 4.4 APIResponse（标准响应格式）

```typescript
interface APIResponse<T = any> {
  code: number // 业务状态码（200 表示成功）
  message: string // 响应消息
  data: T // 响应数据
}
```

---

## 五、使用示例

### 5.1 基本用法

```typescript
import { request } from '@/api/request'

// GET 请求
const dishes = await request.get('/dishes', {
  params: { page: 1, pageSize: 10 }
})

// POST 请求
const result = await request.post('/dishes', {
  name: '宫保鸡丁',
  price: 28,
  categoryId: 1
})

// PUT 请求
await request.put('/dishes/1', { name: '宫保鸡丁(升级版)' })

// DELETE 请求
await request.delete('/dishes/1')
```

### 5.2 文件上传

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'avatar')

const result = await request.upload('/upload', formData)
```

### 5.3 文件下载

```typescript
const blob = await request.download('/export/excel')
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'data.xlsx'
a.click()
```

### 5.4 Toast 配置控制

```typescript
// 禁用 Toast 提示（即使全局开启也不显示）
const result = await request.post('/submit', data, { toast: false })

// 强制启用 Toast 提示（即使全局禁用也显示）
const result = await request.post('/submit', data, { toast: true })

// 自定义 Toast 配置
const result = await request.post('/submit', data, {
  toast: {
    type: 'error',
    message: '提交失败，请稍后重试',
    duration: 5000,
    showClose: true
  }
})

// 自定义提示文本（使用业务响应中的 message）
const result = await request.post('/submit', data, {
  toast: {
    message: '操作失败' // 如果响应中有 message，则使用响应的 message
  }
})

// 使用 Modal 组件（重要操作需要用户确认）
const result = await request.post('/delete', data, {
  toast: {
    type: 'warning',
    message: '确定要删除这条记录吗？',
    component: 'modal',
    title: '删除确认'
  }
})

// 使用 Notification 组件（系统通知）
const result = await request.post('/notify', data, {
  toast: {
    type: 'info',
    message: '您有新的消息通知',
    component: 'notification',
    title: '系统通知'
  }
})
```

### 5.5 Loading 配置控制

```typescript
// 禁用 Loading（即使全局开启也不显示）
const result = await request.get('/data', { loading: false })

// 强制启用 Loading（使用默认配置）
const result = await request.post('/submit', data, { loading: true })

// 自定义 Loading 配置（延迟 500ms 显示，避免快速请求闪烁）
const result = await request.post('/submit', data, {
  loading: {
    delay: 500,
    fullscreen: true
  }
})

// 指定加载目标容器
const container = document.getElementById('form-container')
const result = await request.post('/submit', data, {
  loading: {
    target: container,
    fullscreen: false
  }
})
```

### 5.6 创建租户请求

```typescript
const tenantRequest = request.createTenantRequest('tenant001')
const result = await tenantRequest.get('/orders')
// 请求地址: /api/tenants/tenant001/orders
```

---

## 六、扩展开发

### 6.1 添加自定义中间件

```typescript
import { request } from '@/api/request'

const customMiddleware = async (ctx, next) => {
  // 请求前处理
  console.log('请求开始:', ctx.req.config.url)

  await next()

  // 响应后处理
  console.log('请求结束:', ctx.res?.status)
}

request.use(customMiddleware)
```

### 6.2 扩展中间件类型

```typescript
// 1. Global 中间件（最先执行）
request.core.useGlobal(middleware)

// 2. 普通中间件（按注册顺序执行）
request.use(middleware)

// 3. Core 中间件（最后执行）
request.core.useCore(middleware)
```

### 6.3 自定义请求实例

```typescript
import { Request } from '@/api/request'

const customRequest = new Request()
customRequest.setBaseURL('https://api.example.com')
customRequest.use(async (ctx, next) => {
  ctx.req.config.headers['X-Custom'] = 'custom-value'
  await next()
})

const result = await customRequest.get('/data')
```

---

## 七、配置说明

### 7.1 默认配置

```typescript
const defaultRequestConfig = {
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  retry: false,
  retryCount: 3,
  retryDelay: 1000,
  retryStatusCodes: [502, 503, 504],
  toast: true, // 默认启用 Toast（受环境控制）
  loading: {
    // Loading 默认配置
    enabled: true, // 启用 Loading
    delay: 0, // 无延迟显示
    fullscreen: true // 全屏显示
  }
}
```

### 7.2 环境变量配置

```typescript
// .env.development
VITE_APP_API_BASE_URL=http://localhost:3000/api
VITE_APP_API_TIMEOUT=10000
VITE_APP_ENV=development
```

### 7.3 Toast 全局配置

Toast 提示默认行为：

- **开发/测试环境**：自动启用，响应错误时显示 Toast 提示
- **生产环境**：自动禁用，避免向用户暴露系统错误信息

### 7.4 Loading 全局配置

Loading 状态支持三层配置优先级：

**配置优先级（从低到高）：**

1. **默认配置**：内置的默认 Loading 配置
2. **全局配置**：通过 `getApiConfig()` 设置的全局配置
3. **请求配置**：单个请求的 loading 配置

**配置合并规则：**

| 层级 | 配置示例                                        | 说明         |
| ---- | ----------------------------------------------- | ------------ |
| 默认 | `{ enabled: true, delay: 0, fullscreen: true }` | 内置基础配置 |
| 全局 | `loading: { delay: 300 }`                       | 覆盖默认配置 |
| 请求 | `loading: { delay: 500 }`                       | 覆盖全局配置 |

**全局配置示例：**

```typescript
// src/config/api.ts
import { setApiConfig } from './api'

setApiConfig({
  loading: {
    enabled: true,
    delay: 300, // 全局延迟 300ms 显示
    fullscreen: true
  }
})
```

**Loading 状态默认行为：**

- **全局启用**：默认所有请求都会显示 Loading
- **计数机制**：支持并发请求，所有请求完成后才关闭 Loading
- **延迟显示**：可配置延迟时间，避免快速请求导致的闪烁

---

## 八、错误处理机制

### 8.1 错误处理流程

```
请求异常 → errorHandlerMiddleware / responseHandlerMiddleware
    ├─ 检查 toast 配置
    │   ├─ toast: false → 不显示 Toast
    │   ├─ toast: true → 显示默认 Toast
    │   └─ toast: {...} → 显示自定义 Toast
    ├─ 401 未授权 → 清除 Token → 重定向到 /login
    ├─ 500 服务器错误 → 显示错误 Toast
    ├─ 业务错误（code !== 200）→ 显示业务错误 Toast
    ├─ 网络异常 → 显示网络错误 Toast
    └─ 请求配置异常 → 显示配置错误 Toast
    ↓
重新抛出异常（上层可继续处理）
```

### 8.2 响应校验

```typescript
// 业务响应码不为 200 时抛出异常并显示 Toast
if (data.code !== undefined && data.code !== 200) {
  if (shouldShowToast) {
    showErrorToast(data.message || '请求失败', duration)
  }
  throw new Error(data.message || '请求失败')
}
```

---

## 九、最佳实践

### 9.1 API 模块封装

```typescript
// src/api/modules/dishes.ts
import { request } from '../request'

export const dishesAPI = {
  getList(params: { page: number; pageSize: number }) {
    return request.get('/dishes', { params })
  },
  getById(id: string) {
    return request.get(`/dishes/${id}`)
  },
  create(data: DishForm) {
    return request.post('/dishes', data, {
      toast: { message: '菜品创建成功' },
      loading: { delay: 300 }
    })
  },
  update(id: string, data: DishForm) {
    return request.put(`/dishes/${id}`, data, { toast: false }) // 禁用 Toast
  }
}
```

### 9.2 组件中使用

```typescript
import { dishesAPI } from '@/api/modules/dishes'

// 默认显示 Loading 和 Toast
const { data: dishes } = await dishesAPI.getList({ page: 1, pageSize: 10 })

// 自定义配置
await dishesAPI.create(formData)
```

---

## 十、UI 组件适配

### 10.1 适配层设计

Request 模块设计了统一的 UI 适配层，支持多种 UI 框架的接入。**需要手动注册 UI 组件**，不支持自动识别，确保项目按需引入依赖。

### 10.2 支持的 UI 框架

| 框架               | Toast 组件                                          | Loading 组件 | 接入方式 |
| ------------------ | --------------------------------------------------- | ------------ | -------- |
| **Element Plus**   | `ElMessage` / `ElMessageBox` / `ElNotification`     | `ElLoading`  | 手动注册 |
| **Ant Design Vue** | `antd.message` / `antd.Modal` / `antd.notification` | `antd.Spin`  | 手动注册 |
| **其他框架**       | 自定义组件                                          | 自定义组件   | 手动注册 |

### 10.3 适配层目录结构

```
src/api/request/
└── adapters/           # UI 适配层
    ├── index.ts        # 适配层导出
    ├── types.ts        # 适配层类型定义
    └── UIAdapter.ts    # 适配层实现（手动注册）
```

### 10.4 手动注册机制

适配层需要手动注册各个 UI 组件，支持单独注册或批量注册。

**注册函数列表：**

| 函数                               | 说明                               |
| ---------------------------------- | ---------------------------------- |
| `registerMessage(fn)`              | 注册 message 组件（轻量级提示）    |
| `registerModal(fn)`                | 注册 modal 组件（模态对话框）      |
| `registerNotification(fn)`         | 注册 notification 组件（通知提醒） |
| `registerLoading(show, hide)`      | 注册 loading 组件                  |
| `registerUIComponents(components)` | 批量注册所有组件                   |

### 10.5 自定义 UI 适配器

当使用未内置支持的 UI 框架时，可以自定义适配器：

```typescript
import { setUIAdapter, type UIAdapter } from '@/api/request/adapters'

const myAdapter: UIAdapter = {
  showToast(options) {
    // 调用你的 UI 框架的 Toast 组件
    MyUIFramework.toast({
      type: options.type,
      message: options.message,
      duration: options.duration,
      closeable: options.showClose
    })
  },

  showSuccessToast(message, options) {
    MyUIFramework.toast.success(message, options)
  },

  showWarningToast(message, options) {
    MyUIFramework.toast.warning(message, options)
  },

  showErrorToast(message, options) {
    MyUIFramework.toast.error(message, options)
  },

  showInfoToast(message, options) {
    MyUIFramework.toast.info(message, options)
  },

  showLoading(options) {
    // 调用你的 UI 框架的 Loading 组件
    window.__myLoadingInstance = MyUIFramework.loading({
      target: options.target,
      fullscreen: options.fullscreen,
      text: options.text
    })
  },

  hideLoading() {
    if (window.__myLoadingInstance) {
      window.__myLoadingInstance.close()
      window.__myLoadingInstance = null
    }
  }
}

setUIAdapter(myAdapter)
```

### 10.6 Element Plus 注册示例

```typescript
// src/main.ts 或 src/utils/ui-adapter.ts
import { registerMessage, registerModal, registerNotification, registerLoading } from '@/api/request/adapters'
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'

registerMessage((options) => {
  ElMessage({
    type: options.type,
    message: options.message,
    duration: options.duration,
    showClose: options.showClose
  })
})

registerModal((options) => {
  const title = options.title || getDefaultTitle(options.type)
  const messageBoxMethods = {
    success: ElMessageBox.success,
    warning: ElMessageBox.warning,
    error: ElMessageBox.error,
    info: ElMessageBox.info
  }
  messageBoxMethods[options.type || 'info']?.(options.message, title)
})

registerNotification((options) => {
  ElNotification({
    type: options.type,
    title: options.title || getDefaultTitle(options.type),
    message: options.message,
    duration: options.duration,
    showClose: options.showClose
  })
})

let loadingInstance = null
registerLoading(
  (options) => {
    loadingInstance = ElLoading.service({
      fullscreen: options?.fullscreen !== false,
      lock: options?.lock !== false,
      text: options?.text || '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  },
  () => {
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
  }
)

function getDefaultTitle(type?: string): string {
  const titles: Record<string, string> = {
    success: '成功',
    warning: '警告',
    error: '错误',
    info: '提示'
  }
  return titles[type || 'info']
}
```

### 10.7 Ant Design Vue 注册示例

```typescript
// src/main.ts 或 src/utils/ui-adapter.ts
import { registerMessage, registerModal, registerNotification, registerLoading } from '@/api/request/adapters'
import { message, Modal, notification, Spin } from 'ant-design-vue'

registerMessage((options) => {
  const type = options.type === 'warning' ? 'warn' : options.type
  message[type](options.message, options.duration)
})

registerModal((options) => {
  Modal[options.type || 'info']({
    title: options.title || getDefaultTitle(options.type),
    content: options.message,
    okText: '确定'
  })
})

registerNotification((options) => {
  notification[options.type || 'info']({
    message: options.title || getDefaultTitle(options.type),
    description: options.message,
    duration: options.duration
  })
})

let loadingInstance = null
registerLoading(
  (options) => {
    console.log('Ant Design Spin requires manual DOM manipulation')
  },
  () => {
    console.log('Hide loading')
  }
)

function getDefaultTitle(type?: string): string {
  const titles: Record<string, string> = {
    success: '成功',
    warning: '警告',
    error: '错误',
    info: '提示'
  }
  return titles[type || 'info']
}
```

### 10.8 框架切换示例

切换 UI 框架只需修改注册代码，无需修改业务代码：

```typescript
// Element Plus 注册
import { registerMessage, registerModal, registerNotification, registerLoading } from '@/api/request/adapters'
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'

registerMessage((options) => ElMessage({ type: options.type, message: options.message }))
registerModal((options) => ElMessageBox[options.type || 'info']?.(options.message))
registerNotification((options) => ElNotification({ type: options.type, message: options.message }))
registerLoading(
  (options) => (window.__loading = ElLoading.service(options)),
  () => {
    window.__loading?.close()
    window.__loading = null
  }
)

// 切换为 Ant Design Vue
import { message, Modal, notification } from 'ant-design-vue'

registerMessage((options) => message[options.type === 'warning' ? 'warn' : options.type](options.message))
registerModal((options) => Modal[options.type || 'info']({ content: options.message }))
registerNotification((options) => notification[options.type || 'info']({ description: options.message }))
```

---

## 十一、总结

| 特性             | 说明                                                  |
| ---------------- | ----------------------------------------------------- |
| **架构设计**     | 洋葱模型，支持三层中间件扩展                          |
| **核心能力**     | RESTful 方法封装、文件上传下载、自动重试              |
| **Toast 控制**   | 支持全局/单个请求配置，自定义提示类型、文本、时长     |
| **Loading 控制** | 支持全局/单个请求配置，自定义延迟、目标容器、全屏模式 |
| **UI 适配层**    | 自动识别 Element Plus、Ant Design Vue，支持自定义适配 |
| **扩展能力**     | 支持自定义中间件、自定义请求实例、自定义 UI 适配器    |
| **错误处理**     | 统一错误捕获、401 自动重定向、业务码校验              |
| **类型支持**     | 完整 TypeScript 类型声明，提供代码提示                |
