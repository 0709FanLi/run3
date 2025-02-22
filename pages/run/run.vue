<template>
  <view class="container">
    <!-- 地图区域 -->
    <view class="map-view">
      <web-view 
        :webview-styles="webviewStyles"
        src="/hybrid/html/map.html" 
        @message="handleMessage">
      </web-view>
    </view>
    
    <!-- 使用cover-view显示数据 -->
    <cover-view class="data-container">
      <cover-view class="data-content">
        <!-- 主要数据 -->
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

        <!-- 次要数据 -->
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

        <!-- 按钮区域 -->
        <cover-view class="btn-area">
          <cover-view 
            class="run-btn" 
            :class="{'running': isRunning}" 
            @tap="toggleRun"
          >
            <cover-view class="btn-text">{{ isRunning ? '结束跑步' : '开始跑步' }}</cover-view>
          </cover-view>
        </cover-view>
      </cover-view>
    </cover-view>
  </view>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AiVoiceCoach from '@/components/ai-voice-coach.vue'
import { startRun, endRun, uploadLocation } from '@/utils/run'
import MapView from '@/components/run/map-view.vue'
import StatsPanel from '@/components/run/stats-panel.vue'
import ControlButton from '@/components/run/control-button.vue'

export default {
  components: {
    AiVoiceCoach,
    MapView,
    StatsPanel,
    ControlButton
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
    const mapUrl = ref('/hybrid/html/map.html')
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
    
    // 添加新的响应式变量
    const calories = ref(0)
    const heartRate = ref(null)
    
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
    
    // 添加设置 webview 样式的方法
    const setWebviewStyle = () => {
      // #ifdef APP-PLUS
      setTimeout(() => {
        const pages = getCurrentPages()
        const page = pages[pages.length - 1]
        const currentWebview = page.$getAppWebview()
        
        // 获取子 webview
        const webviews = currentWebview.children()
        if (webviews && webviews[0]) {
          webviews[0].setStyle({
            height: '50vh',
            background: '#ffffff'
          })
          console.log('设置webview样式成功')
        } else {
          console.log('未找到webview')
        }
      }, 300) // 延迟执行确保webview加载完成
      // #endif
      
      // #ifdef MP
      console.log('小程序环境下不支持调整webview样式')
      // #endif
    }

    // 修改 handleMessage 方法
    const handleMessage = (event) => {
      console.log('收到地图消息:', event)
      const message = event.detail || {}
      if (message.type === 'mapReady') {
        updateMapLocation(location.value)
        setWebviewStyle() // 地图准备就绪后设置样式
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
      
      // #ifdef APP-PLUS
      const mapWebview = plus.webview.getWebviewById('map-webview')
      if (mapWebview) {
        // 确保消息能被正确接收
        const messageStr = JSON.stringify(message)
        mapWebview.evalJS(`
          try {
            window.postMessage(${messageStr}, '*');
          } catch(e) {
            console.error('发送消息失败:', e);
          }
        `)
      } else {
        console.error('未找到地图webview')
      }
      // #endif
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
      
      // 计算卡路里（简单估算：假设每公里消耗60卡路里）
      if (distance.value > 0) {
        calories.value = Math.round((distance.value / 1000) * 60)
      }
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
    
    const createMapWebview = () => {
      // #ifdef APP-PLUS
      try {
        const currentWebview = plus.webview.currentWebview()
        
        // 修改创建参数
        const mapWebview = plus.webview.create('/hybrid/html/map.html', 'map-webview', {
          top: '0px',
          height: '50vh',
          width: '100%',
          position: 'static',
          background: 'transparent', // 添加背景透明
          render: 'always', // 保持渲染
          kernel: 'WKWebview' // 使用 WKWebview 内核
        })
        
        // 将webview添加到当前页面
        currentWebview.append(mapWebview)
        
        // 监听webview加载完成事件
        mapWebview.addEventListener('loaded', () => {
          console.log('地图加载完成')
          // 确保地图初始化完成
          mapWebview.evalJS(`
            if (window.map) {
              window.map.enableScrollWheelZoom(true);
              window.map.enableDragging();
            }
          `)
          // 地图加载完成后更新位置
          if (location.value) {
            setTimeout(() => {
              updateMapLocation(location.value)
            }, 500)
          }
        })
        
        return mapWebview
      } catch (err) {
        console.error('创建地图webview失败:', err)
        return null
      }
      // #endif
      
      // #ifdef MP
      return null
      // #endif
    }

    const webviewStyles = {
      progress: false, // 是否显示进度条
      background: '#ffffff' // webview 背景色
    }

    onMounted(() => {
      // #ifdef APP-PLUS
      // 延迟创建地图webview
      setTimeout(() => {
        const mapWebview = createMapWebview()
        if (!mapWebview) {
          uni.showToast({
            title: '创建地图失败',
            icon: 'none'
          })
          return
        }
      }, 500)
      // #endif

      // 获取位置
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: (res) => {
          console.log('初始化位置:', res)
          location.value = res
          // 延迟更新地图位置
          setTimeout(() => {
            updateMapLocation(res)
          }, 1500) // 增加延迟时间
        },
        fail: (err) => {
          console.error('初始化位置获取失败:', err)
          uni.showToast({
            title: '获取位置失败，请检查定位权限',
            icon: 'none'
          })
        }
      })
    })
    
    onUnmounted(() => {
      // #ifdef APP-PLUS
      // 销毁地图webview
      const mapWebview = plus.webview.getWebviewById('map-webview')
      if (mapWebview) {
        mapWebview.close()
      }
      // #endif
      
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
      calories,
      heartRate,
      webviewStyles
    }
  }
}
</script>

<style lang="scss">
.container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

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
    position: relative; // 添加相对定位

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

    .btn-area {
      bottom: calc(var(--window-bottom) + 40rpx); // 调整底部距离
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200rpx; // 确保有足够的高度
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
  }
}
</style> 