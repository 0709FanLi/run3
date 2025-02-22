<template>
  <cover-view class="data-container">
    <cover-view class="data-content">
      <cover-view class="main-data">
        <cover-view class="data-item">
          <cover-view class="value">{{ formatDistance }}</cover-view>
          <cover-view class="label">距离(km)</cover-view>
        </cover-view>
        <cover-view class="data-item">
          <cover-view class="value">{{ formatDuration }}</cover-view>
          <cover-view class="label">时间</cover-view>
        </cover-view>
        <cover-view class="data-item">
          <cover-view class="value">{{ pace }}</cover-view>
          <cover-view class="label">配速</cover-view>
        </cover-view>
      </cover-view>

      <cover-view class="sub-data">
        <cover-view class="stat-box">
          <cover-view class="value">{{ calories }}</cover-view>
          <cover-view class="label">消耗(kcal)</cover-view>
        </cover-view>
        <cover-view class="stat-box">
          <cover-view class="value">{{ heartRate || '--' }}</cover-view>
          <cover-view class="label">心率(bpm)</cover-view>
        </cover-view>
      </cover-view>
    </cover-view>
  </cover-view>
</template>

<script>
export default {
  name: 'StatsPanel',
  props: {
    distance: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    calories: {
      type: Number,
      default: 0
    },
    heartRate: {
      type: Number,
      default: null
    }
  },
  computed: {
    formatDistance() {
      return (this.distance / 1000).toFixed(2)
    },
    formatDuration() {
      const minutes = Math.floor(this.duration / 60)
      const seconds = this.duration % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    pace() {
      if (this.distance === 0) return '00\'00"'
      const paceSeconds = (this.duration / this.distance) * 1000
      const paceMinutes = Math.floor(paceSeconds / 60)
      const remainSeconds = Math.floor(paceSeconds % 60)
      return `${String(paceMinutes).padStart(2, '0')}'${String(remainSeconds).padStart(2, '0')}"`
    }
  }
}
</script>

<style lang="scss">
.data-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 45vh;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 99;

  .data-content {
    padding: 30rpx;
    padding-bottom: calc(var(--window-bottom) + 20rpx);
    position: relative;

    .main-data {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30rpx;

      .data-item {
        flex: 1;
        text-align: center;

        .value {
          font-size: 48rpx;
          font-weight: bold;
          color: #333;
        }

        .label {
          font-size: 24rpx;
          color: #666;
          margin-top: 10rpx;
        }
      }
    }

    .sub-data {
      display: flex;
      margin: 0 -10rpx 30rpx;

      .stat-box {
        flex: 1;
        margin: 0 10rpx;
        background: #f8f8f8;
        padding: 20rpx;
        border-radius: 16rpx;
        text-align: center;

        .value {
          font-size: 36rpx;
          font-weight: bold;
          color: #333;
        }

        .label {
          font-size: 24rpx;
          color: #666;
          margin-top: 6rpx;
        }
      }
    }
  }
}
</style> 