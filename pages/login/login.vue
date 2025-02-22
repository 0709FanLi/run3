<template>
  <view class="login-container">
    <image class="bg-image" src="/static/login-bg.jpg" mode="aspectFill"></image>
    <view class="content">
      <view class="title">运动助手</view>
      <view class="form">
        <view class="input-group">
          <input type="number" v-model="phone" maxlength="11" placeholder="请输入手机号" />
        </view>
        <view class="input-group code">
          <input type="number" v-model="code" maxlength="6" placeholder="请输入验证码" />
          <text class="code-btn" @tap="getCode">{{codeText}}</text>
        </view>
        <button class="submit-btn" @tap="handleLogin">登录/注册</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      code: '',
      codeText: '获取验证码',
      counting: false,
      timer: null,
      countdown: 60
    }
  },
  methods: {
    getCode() {
      if (this.counting) return
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      this.counting = true
      this.countdown = 60
      this.timer = setInterval(() => {
        this.countdown--
        this.codeText = `${this.countdown}s后重试`
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.counting = false
          this.codeText = '获取验证码'
        }
      }, 1000)
      
      // TODO: 调用验证码接口
    },
    handleLogin() {
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      if (!/^\d{6}$/.test(this.code)) {
        uni.showToast({
          title: '请输入正确的验证码',
          icon: 'none'
        })
        return
      }
      
      // TODO: 调用登录接口
      uni.switchTab({
        url: '/pages/run/run'
      })
    }
  },
  onUnmounted() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style lang="scss">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  
  .bg-image {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  
  .content {
    position: relative;
    z-index: 2;
    padding-top: 200rpx;
    
    .title {
      text-align: center;
      font-size: 48rpx;
      color: #fff;
      font-weight: bold;
      margin-bottom: 100rpx;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .form {
      padding: 0 50rpx;
      
      .input-group {
        background: rgba(255,255,255,0.9);
        border-radius: 45rpx;
        padding: 20rpx 40rpx;
        margin-bottom: 30rpx;
        
        &.code {
          display: flex;
          align-items: center;
          
          .code-btn {
            font-size: 28rpx;
            color: #18B566;
            padding-left: 30rpx;
          }
        }
        
        input {
          height: 60rpx;
          font-size: 32rpx;
        }
      }
      
      .submit-btn {
        background: #18B566;
        color: #fff;
        border-radius: 45rpx;
        height: 90rpx;
        line-height: 90rpx;
        font-size: 32rpx;
        margin-top: 60rpx;
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}
</style> 