// 封装请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: process.env.VUE_APP_API_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'content-type': 'application/json',
        'Authorization': uni.getStorageSync('token') || ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token过期,跳转登录
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.reLaunch({
            url: '/pages/login/login'
          })
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export default request 