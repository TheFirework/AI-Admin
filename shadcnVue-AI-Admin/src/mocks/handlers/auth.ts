import { http, HttpResponse } from 'msw'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    const { username, password } = body as { username: string; password: string }
    
    if (username === 'admin' && password === '123456') {
      return HttpResponse.json({
        code: 200,
        message: '登录成功',
        data: {
          token: 'mock-token-12345',
          user: {
            id: 1,
            username: 'admin',
            name: '管理员'
          }
        }
      })
    }
    
    return HttpResponse.json({
      code: 401,
      message: '用户名或密码错误'
    }, { status: 401 })
  })
]
