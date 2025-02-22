<template>
  <view class="run-container">
    <web-view v-if="isRunning" 
      ref="mapWebview"
      class="map" 
      :src="mapUrl"
      @message="handleMessage">
    </web-view>
    
    <!-- 未开始跑步时的开始按钮 -->
    <view v-if="!isRunning" class="start-overlay">
      <view class="start-button-wrapper">
        <view class="pulse-ring"></view>
        <view class="start-button" @tap="toggleRun">
          <text>开始跑步</text>
        </view>
      </view>
    </view>
    
    <view class="run-info" :class="{ 'running': isRunning }">
      <view class="stats-container">
        <view class="stat-item">
          <text class="value">{{ formatDistance }}</text>
          <text class="label">距离(km)</text>
        </view>
        <view class="stat-item">
          <text class="value">{{ formatDuration }}</text>
          <text class="label">时间</text>
        </view>
        <view class="stat-item">
          <text class="value">{{ pace }}</text>
          <text class="label">配速</text>
        </view>
      </view>
      
      <view v-if="isRunning" class="run-button running" @tap="toggleRun">
        <text>结束跑步</text>
      </view>
    </view>
    
    <!-- AI语音提示组件 -->
    <ai-voice-coach 
      v-if="isRunning"
      :pace="pace"
      :distance="distance"
      :duration="duration">
    </ai-voice-coach>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AiVoiceCoach from '@/components/ai-voice-coach.vue'
import { startRun, endRun, uploadLocation } from '@/utils/run'

export default {
  components: {
    AiVoiceCoach
  },
  setup() {
    const isRunning = ref(false)
    const location = ref({
      latitude: 39.909,
      longitude: 116.397
    })
    const distance = ref(0)
    const duration = ref(0)
    const polyline = ref([])
    const markers = ref([])
    const locationTimer = ref(null)
    const durationTimer = ref(null)
    const trackPoints = ref([])
    const mapUrl = ref('_www/hybrid/html/map.html')
    const mapWebview = ref(null)
    
    // 添加重试相关变量
    const retryCount = ref(0)
    const maxRetries = 3
    
    // 格式化距离
    const formatDistance = computed(() => {
      return (distance.value / 1000).toFixed(2)
    })
    
    // 格式化时间
    const formatDuration = computed(() => {
      const minutes = Math.floor(duration.value / 60)
      const seconds = duration.value % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    })
    
    // 计算配速
    const pace = computed(() => {
      if (distance.value === 0) return '00\'00"'
      const paceSeconds = (duration.value / distance.value) * 1000
      const paceMinutes = Math.floor(paceSeconds / 60)
      const remainSeconds = Math.floor(paceSeconds % 60)
      return `${String(paceMinutes).padStart(2, '0')}'${String(remainSeconds).padStart(2, '0')}"`
    })
    
    // 添加权限检查方法
    const checkAndRequestPermission = () => {
      return new Promise((resolve, reject) => {
        // #ifdef APP-PLUS
        const checkSystemLocation = () => {
          if (plus.os.name === 'Android') {
            const context = plus.android.runtimeMainActivity();
            const locationManager = plus.android.importClass("android.location.LocationManager");
            const lm = context.getSystemService("location");
            return lm.isProviderEnabled(locationManager.GPS_PROVIDER);
          }
          return true;
        }

        if (!checkSystemLocation()) {
          uni.showModal({
            title: '提示',
            content: '请开启手机GPS定位功能',
            success: (res) => {
              if (res.confirm) {
                if (plus.os.name === 'Android') {
                  const Intent = plus.android.importClass('android.content.Intent');
                  const Settings = plus.android.importClass('android.provider.Settings');
                  const intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                  plus.android.runtimeMainActivity().startActivity(intent);
                }
              }
            }
          });
          reject(new Error('GPS未开启'));
          return;
        }

        plus.android.requestPermissions(
          ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_COARSE_LOCATION'],
          function(resultObj) {
            if (resultObj.granted.length === 2) {
              resolve();
            } else {
              uni.showModal({
                title: '提示',
                content: '请授予应用位置权限，否则无法使用跑步功能',
                success: (res) => {
                  if (res.confirm) {
                    if (plus.os.name === 'Android') {
                      const Intent = plus.android.importClass('android.content.Intent');
                      const Settings = plus.android.importClass('android.provider.Settings');
                      const Uri = plus.android.importClass('android.net.Uri');
                      const mainActivity = plus.android.runtimeMainActivity();
                      const intent = new Intent();
                      intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                      intent.setData(Uri.fromParts('package', mainActivity.getPackageName(), null));
                      mainActivity.startActivity(intent);
                    }
                  }
                }
              });
              reject(new Error('未授予位置权限'));
            }
          },
          function(error) {
            reject(error);
          }
        );
        // #endif

        // #ifndef APP-PLUS
        resolve();
        // #endif
      });
    }
    
    // 处理web-view消息
    const handleMessage = (event) => {
      console.log('收到地图消息:', event)
      const message = event.detail || {}
      if (message.type === 'mapReady') {
        updateMapLocation(location.value)
      }
    }

    // 更新地图位置
    const updateMapLocation = (loc) => {
      if (!loc || !loc.latitude || !loc.longitude) {
        console.error('无效的位置数据:', loc)
        return
      }
      
      const message = {
        type: 'updateLocation',
        latitude: loc.latitude,
        longitude: loc.longitude
      }
      console.log('发送位置更新:', message)
      
      // 使用 uni 的方式获取 webview
      const pages = getCurrentPages()
      const page = pages[pages.length - 1]
      const currentWebview = page.$getAppWebview()
      
      // 获取子 webview
      const webviews = currentWebview.children()
      const mapWebview = webviews.find(v => v.getURL().includes('map.html'))
      
      if (mapWebview) {
        mapWebview.evalJS(`
          if (window.postMessage) {
            window.postMessage(${JSON.stringify(message)}, '*');
          }
        `)
      } else {
        console.error('未找到地图webview, 等待重试')
        // 延迟重试
        setTimeout(() => {
          updateMapLocation(loc)
        }, 500)
      }
    }

    // 开始/结束跑步
    const toggleRun = async () => {
      if (!isRunning.value) {
        try {
          await checkAndRequestPermission()
          
          uni.showLoading({
            title: '定位中...'
          })
          
          const gpsStatus = await checkGPSStatus()
          if (!gpsStatus) {
            throw new Error('请开启GPS定位功能')
          }

          // 重置重试计数
          retryCount.value = 0
          const res = await getLocationWithRetry()
          
          uni.hideLoading()
          console.log('获取到位置:', res)
          
          location.value = res
          isRunning.value = true
          
          // 延长等待时间
          setTimeout(() => {
            updateMapLocation(res)
          }, 2000)
          
          startTracking()
        } catch (err) {
          uni.hideLoading()
          console.error('开始跑步失败:', err)
          uni.showToast({
            title: err.message || '定位失败，请检查GPS和网络状态',
            icon: 'none',
            duration: 3000
          })
        }
      } else {
        stopTracking()
        isRunning.value = false
        
        // 修改重置地图的方式
        const pages = getCurrentPages()
        const page = pages[pages.length - 1]
        const currentWebview = page.$getAppWebview()
        const webviews = currentWebview.children()
        const mapWebview = webviews.find(v => v.getURL().includes('map.html'))
        
        if (mapWebview) {
          mapWebview.evalJS(`
            if (window.postMessage) {
              window.postMessage({ type: 'reset' }, '*');
            }
          `)
        }
        
        try {
          const runData = {
            distance: distance.value,
            duration: duration.value,
            pace: pace.value
          }
          
          await endRun(runData)
          
          uni.showToast({
            title: '完成跑步! 获得5积分',
            icon: 'none'
          })
        } catch (err) {
          uni.showToast({
            title: '上传跑步数据失败',
            icon: 'none'
          })
        }
        
        resetRunData()
      }
    }
    
    // 添加 GPS 状态检查方法
    const checkGPSStatus = () => {
      return new Promise((resolve) => {
        if (plus.os.name === 'Android') {
          const context = plus.android.runtimeMainActivity()
          const locationManager = plus.android.importClass('android.location.LocationManager')
          const lm = context.getSystemService('location')
          
          if (!lm.isProviderEnabled(locationManager.GPS_PROVIDER)) {
            uni.showModal({
              title: '提示',
              content: '请开启GPS定位功能',
              confirmText: '去开启',
              success: (res) => {
                if (res.confirm) {
                  const Intent = plus.android.importClass('android.content.Intent')
                  const Settings = plus.android.importClass('android.provider.Settings')
                  const intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
                  context.startActivity(intent)
                }
              }
            })
            resolve(false)
          } else {
            resolve(true)
          }
        } else {
          resolve(true)
        }
      })
    }
    
    // 修改 getLocationWithRetry 方法
    const getLocationWithRetry = async () => {
      try {
        console.log(`尝试获取位置，第${retryCount.value + 1}次`)
        return new Promise((resolve, reject) => {
          uni.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            timeout: 15000,
            provider: 'system',
            geocode: true,
            altitude: true, // 获取海拔高度
            success: (res) => {
              console.log('定位成功:', res)
              // 确保返回的坐标有效
              if (res.latitude && res.longitude) {
                resolve(res)
              } else {
                reject(new Error('获取到的坐标无效'))
              }
            },
            fail: (err) => {
              console.error('定位失败:', err)
              reject(err)
            }
          })
        })
      } catch (err) {
        if (retryCount.value < maxRetries) {
          retryCount.value++
          await new Promise(resolve => setTimeout(resolve, 1000))
          return getLocationWithRetry()
        }
        throw err
      }
    }
    
    // 修改 startTracking 方法
    const startTracking = () => {
      locationTimer.value = setInterval(() => {
        uni.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          timeout: 10000,
          provider: 'system',
          geocode: true,
          altitude: true,
          success: (res) => {
            console.log('位置更新:', res)
            if (res.latitude && res.longitude) {
              location.value = res
              updateMapLocation(res)
              
              // 计算距离
              if (trackPoints.value.length > 0) {
                const lastPoint = trackPoints.value[trackPoints.value.length - 1]
                const newDistance = calculateDistance(
                  lastPoint[1], lastPoint[0],
                  res.latitude, res.longitude
                )
                if (newDistance > 0.5 && newDistance < 100) { // 过滤异常数据
                  distance.value += newDistance
                  trackPoints.value.push([res.longitude, res.latitude])
                }
              } else {
                trackPoints.value.push([res.longitude, res.latitude])
              }
            }
          },
          fail: (err) => {
            console.error('位置更新失败:', err)
          }
        })
      }, 3000)
      
      durationTimer.value = setInterval(() => {
        duration.value++
      }, 1000)
    }
    
    // 停止追踪
    const stopTracking = () => {
      clearInterval(locationTimer.value)
      clearInterval(durationTimer.value)
    }
    
    // 重置跑步数据
    const resetRunData = () => {
      distance.value = 0
      duration.value = 0
      polyline.value = []
      trackPoints.value = []
    }
    
    // 计算两点之间距离
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000 // 地球半径(米)
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }
    
    // 修改 onMounted 钩子
    onMounted(() => {
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: (res) => {
          console.log('初始化位置:', res)
          location.value = res
        },
        fail: (err) => {
          console.error('初始化位置获取失败:', err)
        }
      })
    })
    
    onUnmounted(() => {
      stopTracking()
    })
    
    return {
      isRunning,
      location,
      distance,
      duration,
      polyline,
      markers,
      formatDistance,
      formatDuration,
      pace,
      mapUrl,
      toggleRun,
      handleMessage,
      retryCount,
      maxRetries,
      mapWebview
    }
  }
}
</script>

<style lang="scss">
.run-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #f8f8f8;
  
  .map {
    width: 100%;
    height: 100%;
  }
  
  .location-marker {
    position: absolute;
    width: 40rpx;
    height: 40rpx;
  }
  
  .start-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    
    .start-button-wrapper {
      position: relative;
      
      .pulse-ring {
        position: absolute;
        width: 240rpx;
        height: 240rpx;
        border-radius: 50%;
        background: rgba(24,181,102,0.1);
        animation: pulse 2s infinite;
      }
      
      .start-button {
        width: 200rpx;
        height: 200rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #18B566, #1ED677);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(24,181,102,0.3);
        position: relative;
        z-index: 1;
        
        text {
          color: #fff;
          font-size: 32rpx;
          font-weight: bold;
        }
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
  
  .run-info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    padding: 30rpx;
    border-radius: 30rpx 30rpx 0 0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s;
    
    &.running {
      background: rgba(255,255,255,0.9);
    }
    
    .stats-container {
      display: flex;
      justify-content: space-around;
      margin-bottom: 40rpx;
      
      .stat-item {
        text-align: center;
        
        .value {
          display: block;
          font-size: 40rpx;
          font-weight: bold;
          color: #333;
        }
        
        .label {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
    
    .run-button {
      width: 200rpx;
      height: 200rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #18B566, #1ED677);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(24,181,102,0.3);
      
      &.running {
        background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
        box-shadow: 0 4px 10px rgba(255,107,107,0.3);
      }
      
      text {
        color: #fff;
        font-size: 32rpx;
        font-weight: bold;
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}
</style> 