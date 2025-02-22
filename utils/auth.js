// 用户认证相关方法
import request from './request'

export const login = (phone, code) => {
  return request({
    url: '/api/login',
    method: 'POST',
    data: {
      phone,
      code
    }
  })
}

export const getUserInfo = () => {
  return request({
    url: '/api/user/info'
  })
}

export const updateUserInfo = (data) => {
  return request({
    url: '/api/user/info',
    method: 'PUT',
    data
  })
} 