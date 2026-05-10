import type { Directive, DirectiveBinding } from 'vue'

// 用户权限存储
const userPermissions = new Set<string>()

export function setPermissions(permissions: string[]) {
  userPermissions.clear()
  permissions.forEach(perm => userPermissions.add(perm))
}

export function hasPermission(permission: string): boolean {
  if (!permission) return true
  // 支持通配符匹配，如 system:* 或 system:users:*
  const parts = permission.split(':')
  for (const userPerm of userPermissions) {
    const userParts = userPerm.split(':')
    let match = true
    for (let i = 0; i < parts.length; i++) {
      if (userParts[i] === '*' || parts[i] === '*') {
        match = true
        break
      }
      if (userParts[i] !== parts[i]) {
        match = false
        break
      }
    }
    if (match) return true
  }
  return false
}

const permDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const permission = binding.value
    if (!hasPermission(permission)) {
      el.style.display = 'none'
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const permission = binding.value
    if (!hasPermission(permission)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

export default permDirective
