<template>
  <view class="container">
    <view class="login-form">
      <view class="title">运动助手</view>
      <view class="form-item">
        <input 
          type="number" 
          v-model="phone" 
          placeholder="请输入手机号" 
          maxlength="11"
        />
      </view>
      <view class="form-item code-item">
        <input 
          type="number" 
          v-model="code" 
          placeholder="请输入验证码" 
          maxlength="6"
        />
        <text 
          class="get-code" 
          :class="{ disabled: counting }" 
          @tap="getCode"
        >
          {{ counting ? `${counter}s后重试` : '获取验证码' }}
        </text>
      </view>
      <button class="login-btn" @tap="handleLogin">登录</button>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const phone = ref('18768880709') // 设置默认手机号
    const code = ref('123456') // 设置默认验证码
    const counting = ref(false)
    const counter = ref(60)
    
    // 自动填充默认值
    onMounted(() => {
      phone.value = '18768880709'
      code.value = '123456'
    })

    const getCode = () => {
      if (counting.value) return
      
      if (!/^1[3-9]\d{9}$/.test(phone.value)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      // 直接显示验证码已发送
      uni.showToast({
        title: '验证码已发送',
        icon: 'none'
      })
      
      // 开始倒计时
      counting.value = true
      counter.value = 60
      const timer = setInterval(() => {
        counter.value--
        if (counter.value <= 0) {
          clearInterval(timer)
          counting.value = false
        }
      }, 1000)
    }

    const handleLogin = () => {
      if (!/^1[3-9]\d{9}$/.test(phone.value)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      if (!/^\d{6}$/.test(code.value)) {
        uni.showToast({
          title: '请输入正确的验证码',
          icon: 'none'
        })
        return
      }
      
      // 使用默认值直接登录
      if (phone.value === '18768880709' && code.value === '123456') {
        uni.setStorageSync('token', 'default_token')
        uni.setStorageSync('userInfo', {
          phone: phone.value
        })
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 修改跳转路径为 run 页面
        setTimeout(() => {
          // 先清除所有页面，再跳转到 run 页面
          uni.reLaunch({
            url: '/pages/run/run'
          })
        }, 1500)
      } else {
        uni.showToast({
          title: '手机号或验证码错误',
          icon: 'none'
        })
      }
    }

    return {
      phone,
      code,
      counting,
      counter,
      getCode,
      handleLogin
    }
  }
}
</script>

<style lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/static/login.png') no-repeat center center;
  background-size: cover;
  
  .login-form {
    width: 80%;
    padding: 40rpx;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    
    .title {
      font-size: 40rpx;
      font-weight: bold;
      text-align: center;
      color: #333;
      margin-bottom: 60rpx;
    }
    
    .form-item {
      border-bottom: 1px solid #eee;
      margin-bottom: 40rpx;
      padding: 20rpx 0;
      
      input {
        font-size: 32rpx;
        width: 100%;
      }
    }
    
    .code-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      input {
        flex: 1;
        margin-right: 20rpx;
      }
      
      .get-code {
        color: #18B566;
        font-size: 28rpx;
        padding: 10rpx 0;
        white-space: nowrap;
        
        &.disabled {
          color: #999;
        }
      }
    }
    
    .login-btn {
      margin-top: 60rpx;
      background: #18B566;
      color: #fff;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      
      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style> 