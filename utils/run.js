// 运动相关方法
import request from './request'

export const startRun = () => {
  return request({
    url: '/api/run/start',
    method: 'POST'
  })
}

export const endRun = (data) => {
  return request({
    url: '/api/run/end',
    method: 'POST',
    data
  })
}

export const uploadLocation = (data) => {
  return request({
    url: '/api/run/location',
    method: 'POST',
    data
  })
} 