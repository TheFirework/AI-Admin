import { request } from '../request/request'

const urls = {
  login: '/auth/login'
}

export const authApi = {
  login: (data: { username: string; password: string }) =>
    request.post<{ token: string; user: { id: number; username: string; name: string } }>(urls.login, data)
}
