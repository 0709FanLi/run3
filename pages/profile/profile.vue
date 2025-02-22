<template>
  <view class="profile-container">
    <!-- 用户信息 -->
    <view class="user-info">
      <image class="avatar" src="/static/default-avatar.png"></image>
      <view class="info">
        <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
        <view class="points">
          <text class="label">我的积分:</text>
          <text class="value">{{ userInfo.points || 0 }}</text>
        </view>
      </view>
    </view>
    
    <!-- 运动数据 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="value">{{ userInfo.totalDistance || 0 }}</text>
        <text class="label">总里程(km)</text>
      </view>
      <view class="stat-item">
        <text class="value">{{ userInfo.totalDuration || 0 }}</text>
        <text class="label">总时长(h)</text>
      </view>
      <view class="stat-item">
        <text class="value">{{ userInfo.totalRuns || 0 }}</text>
        <text class="label">跑步次数</text>
      </view>
    </view>
    
    <!-- 奖品列表 -->
    <view class="rewards-section">
      <view class="section-title">可兑换奖品</view>
      <scroll-view class="rewards-list" scroll-y>
        <view class="reward-item" 
          v-for="item in rewards" 
          :key="item.id"
          @tap="handleExchange(item)"
          :class="{ 'disabled': userInfo.points < item.points }">
          <image class="reward-image" :src="item.image" mode="aspectFill"></image>
          <view class="reward-info">
            <text class="name">{{ item.name }}</text>
            <text class="points">{{ item.points }}积分</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 兑换弹窗 -->
    <uni-popup ref="exchangePopup" type="center">
      <view class="exchange-popup">
        <view class="popup-title">确认兑换</view>
        <view class="popup-content">
          <view class="reward-detail">
            <image :src="selectedReward.image" mode="aspectFill"></image>
            <view class="detail-info">
              <text class="name">{{ selectedReward.name }}</text>
              <text class="points">{{ selectedReward.points }}积分</text>
            </view>
          </view>
          
          <view class="address-section">
            <view class="section-title">收货地址</view>
            <view v-if="userInfo.address" class="saved-address" @tap="showAddressEdit">
              <text class="name">{{ userInfo.address.name }}</text>
              <text class="phone">{{ userInfo.address.phone }}</text>
              <text class="address">{{ userInfo.address.address }}</text>
            </view>
            <button v-else class="add-address-btn" @tap="showAddressEdit">添加收货地址</button>
          </view>
        </view>
        
        <view class="popup-buttons">
          <button class="cancel-btn" @tap="closeExchangePopup">取消</button>
          <button class="confirm-btn" @tap="confirmExchange">确认兑换</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 地址编辑弹窗 -->
    <uni-popup ref="addressPopup" type="center">
      <view class="address-popup">
        <view class="popup-title">{{ userInfo.address ? '编辑地址' : '新增地址' }}</view>
        <view class="form">
          <input 
            class="input" 
            v-model="addressForm.name" 
            placeholder="收货人姓名"
          />
          <input 
            class="input" 
            v-model="addressForm.phone" 
            type="number"
            maxlength="11"
            placeholder="手机号码"
          />
          <input 
            class="input" 
            v-model="addressForm.address" 
            placeholder="详细地址"
          />
        </view>
        <view class="popup-buttons">
          <button class="cancel-btn" @tap="closeAddressPopup">取消</button>
          <button class="confirm-btn" @tap="saveAddress">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  setup() {
    const userInfo = reactive({
      nickname: '跑步达人',
      points: 100,
      totalDistance: 25.6,
      totalDuration: 3.5,
      totalRuns: 12,
      address: null
    })
    
    const rewards = ref([
      {
        id: 1,
        name: '运动水壶',
        points: 50,
        image: '/static/rewards/bottle.jpg'
      },
      {
        id: 2,
        name: '运动手环',
        points: 200,
        image: '/static/rewards/band.jpg'
      },
      {
        id: 3,
        name: '跑步鞋',
        points: 500,
        image: '/static/rewards/shoes.jpg'
      }
    ])
    
    const selectedReward = ref({})
    const addressForm = reactive({
      name: '',
      phone: '',
      address: ''
    })
    
    const exchangePopup = ref(null)
    const addressPopup = ref(null)
    
    // 处理奖品兑换
    const handleExchange = (reward) => {
      if (userInfo.points < reward.points) {
        uni.showToast({
          title: '积分不足',
          icon: 'none'
        })
        return
      }
      
      selectedReward.value = reward
      exchangePopup.value.open()
    }
    
    // 显示地址编辑
    const showAddressEdit = () => {
      if (userInfo.address) {
        addressForm.name = userInfo.address.name
        addressForm.phone = userInfo.address.phone
        addressForm.address = userInfo.address.address
      }
      addressPopup.value.open()
    }
    
    // 保存地址
    const saveAddress = () => {
      if (!addressForm.name || !addressForm.phone || !addressForm.address) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(addressForm.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      userInfo.address = { ...addressForm }
      addressPopup.value.close()
    }
    
    // 确认兑换
    const confirmExchange = () => {
      if (!userInfo.address) {
        uni.showToast({
          title: '请先添加收货地址',
          icon: 'none'
        })
        return
      }
      
      // TODO: 调用兑换接口
      userInfo.points -= selectedReward.value.points
      
      uni.showToast({
        title: '兑换成功',
        icon: 'success'
      })
      
      exchangePopup.value.close()
    }
    
    return {
      userInfo,
      rewards,
      selectedReward,
      addressForm,
      exchangePopup,
      addressPopup,
      handleExchange,
      showAddressEdit,
      saveAddress,
      confirmExchange,
      closeExchangePopup: () => exchangePopup.value.close(),
      closeAddressPopup: () => addressPopup.value.close()
    }
  }
}
</script>

<style lang="scss">
.profile-container {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 30rpx;
  
  .user-info {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 30rpx;
    
    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      margin-right: 30rpx;
    }
    
    .info {
      .nickname {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .points {
        font-size: 28rpx;
        color: #666;
        
        .value {
          color: #18B566;
          font-weight: bold;
          margin-left: 10rpx;
        }
      }
    }
  }
  
  .stats-card {
    display: flex;
    justify-content: space-around;
    padding: 30rpx;
    background: #fff;
    border-radius: 20rpx;
    margin-bottom: 30rpx;
    
    .stat-item {
      text-align: center;
      
      .value {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
  
  .rewards-section {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 30rpx;
    }
    
    .rewards-list {
      height: 800rpx;
      
      .reward-item {
        display: flex;
        align-items: center;
        padding: 20rpx;
        border-bottom: 1px solid #f5f5f5;
        
        &.disabled {
          opacity: 0.5;
        }
        
        .reward-image {
          width: 120rpx;
          height: 120rpx;
          border-radius: 10rpx;
          margin-right: 20rpx;
        }
        
        .reward-info {
          flex: 1;
          
          .name {
            font-size: 28rpx;
            color: #333;
            margin-bottom: 10rpx;
          }
          
          .points {
            font-size: 24rpx;
            color: #18B566;
          }
        }
      }
    }
  }
}

.exchange-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  
  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .reward-detail {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #f8f8f8;
    border-radius: 10rpx;
    margin-bottom: 30rpx;
    
    image {
      width: 100rpx;
      height: 100rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }
    
    .detail-info {
      .name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .points {
        font-size: 24rpx;
        color: #18B566;
      }
    }
  }
  
  .address-section {
    .section-title {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 20rpx;
    }
    
    .saved-address {
      background: #f8f8f8;
      padding: 20rpx;
      border-radius: 10rpx;
      
      .name {
        font-size: 28rpx;
        color: #333;
      }
      
      .phone {
        font-size: 28rpx;
        color: #666;
        margin-left: 20rpx;
      }
      
      .address {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-top: 10rpx;
      }
    }
    
    .add-address-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background: #f8f8f8;
      color: #666;
      border-radius: 10rpx;
      font-size: 28rpx;
    }
  }
  
  .popup-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    
    button {
      width: 45%;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 40rpx;
      font-size: 28rpx;
      
      &.cancel-btn {
        background: #f5f5f5;
        color: #666;
      }
      
      &.confirm-btn {
        background: #18B566;
        color: #fff;
      }
    }
  }
}

.address-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  
  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .form {
    .input {
      width: 100%;
      height: 80rpx;
      background: #f8f8f8;
      border-radius: 10rpx;
      padding: 0 20rpx;
      margin-bottom: 20rpx;
      font-size: 28rpx;
    }
  }
  
  .popup-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 30rpx;
    
    button {
      width: 45%;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 40rpx;
      font-size: 28rpx;
      
      &.cancel-btn {
        background: #f5f5f5;
        color: #666;
      }
      
      &.confirm-btn {
        background: #18B566;
        color: #fff;
      }
    }
  }
}
</style> 