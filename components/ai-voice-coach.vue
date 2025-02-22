<template>
  <view class="voice-coach"></view>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  props: {
    pace: String,
    distance: Number,
    duration: Number
  },
  
  setup(props) {
    const lastVoiceTime = ref(0)
    const voiceContext = ref(null)
    
    // 监听配速变化
    watch(() => props.pace, (newPace) => {
      const now = Date.now()
      if (now - lastVoiceTime.value < 30000) return // 30秒内不重复提醒
      
      const paceMinutes = parseInt(newPace.split("'")[0])
      if (paceMinutes < 4) {
        speak('请注意,您的配速过快,建议放慢速度')
      } else if (paceMinutes > 8) {
        speak('加油,可以稍微加快步伐')
      }
      
      lastVoiceTime.value = now
    })
    
    // 每公里提醒
    watch(() => props.distance, (newDistance, oldDistance) => {
      if (Math.floor(newDistance/1000) > Math.floor(oldDistance/1000)) {
        const km = Math.floor(newDistance/1000)
        speak(`已完成${km}公里,继续加油`)
      }
    })
    
    // 语音播报
    const speak = (text) => {
      if (!voiceContext.value) {
        voiceContext.value = uni.createInnerAudioContext()
      }
      
      // TODO: 调用文字转语音API
      console.log('语音提示:', text)
    }
    
    return {
      speak
    }
  }
}
</script>

<style>
.voice-coach {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style> 