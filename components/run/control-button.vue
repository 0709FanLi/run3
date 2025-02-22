<template>
  <cover-view class="btn-area">
    <cover-view 
      class="run-btn" 
      :class="{'running': isRunning}" 
      @tap="handleTap"
    >
      <cover-view class="btn-text">{{ isRunning ? '结束跑步' : '开始跑步' }}</cover-view>
    </cover-view>
  </cover-view>
</template>

<script>
export default {
  name: 'ControlButton',
  props: {
    isRunning: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleTap() {
      this.$emit('tap')
    }
  }
}
</script>

<style lang="scss">
.btn-area {
  bottom: calc(var(--window-bottom) + 40rpx);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  z-index: 100;

  .run-btn {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: #69f;
    box-shadow: 0 4px 10px rgba(24,181,102,0.3);
    display: flex;
    align-items: center;
    justify-content: center;

    &.running {
      width: 400rpx;
      height: 90rpx;
      border-radius: 45rpx;
    }

    .btn-text {
      color: #fff;
      font-size: 32rpx;
      font-weight: bold;
      text-align: center;
    }
  }
}
</style> 