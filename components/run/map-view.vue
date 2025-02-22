<template>
  <view class="map-view">
    <!-- #ifdef APP-PLUS -->
    <web-view 
      :webview-styles="webviewStyles"
      src="/hybrid/html/map.html" 
      @message="handleMessage">
    </web-view>
    <!-- #endif -->
    
    <!-- #ifdef MP -->
    <web-view :src="mapUrl" @message="handleMessage"></web-view>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  name: 'MapView',
  props: {
    location: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      webviewStyles: {
        progress: false,
        background: '#ffffff'
      },
      mapUrl: '/hybrid/html/map.html'
    }
  },
  methods: {
    handleMessage(event) {
      this.$emit('message', event)
    }
  }
}
</script>

<style lang="scss">
.map-view {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style> 