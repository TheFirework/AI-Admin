/**
 * localStorage 工具类
 * 提供统一的本地存储操作方法
 */

import { STORAGE_KEYS } from '@/config/storage'

export const storage = {
  /**
   * 设置 token
   */
  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  },

  /**
   * 获取 token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  /**
   * 移除 token
   */
  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return this.getToken() !== null
  },

  /**
   * 清空所有存储
   */
  clear(): void {
    localStorage.clear()
  },

  /**
   * 设置通用存储
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  /**
   * 获取通用存储
   */
  get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },

  /**
   * 移除通用存储
   */
  remove(key: string): void {
    localStorage.removeItem(key)
  }
}

export default storage
