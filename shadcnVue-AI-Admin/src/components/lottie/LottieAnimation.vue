<template>
  <div ref="containerRef" :class="clsx('lottie-container', className)" :style="containerStyle" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { clsx } from 'clsx'
import lottie, { type AnimationItem, type AnimationConfigWithData, type AnimationConfigWithPath, type RendererType } from 'lottie-web'

export interface LottieOptions {
  loop?: boolean
  autoplay?: boolean
  speed?: number
  renderer?: RendererType
  rendererSettings?: object
}

export interface LottieInstance extends AnimationItem {
  container: HTMLElement
}

interface Props {
  animationData?: object
  path?: string
  width?: number | string
  height?: number | string
  loop?: boolean
  autoplay?: boolean
  speed?: number
  renderer?: 'svg' | 'canvas' | 'html'
  className?: string
  style?: object
}

const props = withDefaults(defineProps<Props>(), {
  animationData: undefined,
  path: '',
  width: 200,
  height: 200,
  loop: true,
  autoplay: true,
  speed: 1,
  renderer: 'svg',
  className: '',
  style: () => ({})
})

const emit = defineEmits<{
  (e: 'ready', instance: LottieInstance): void
  (e: 'complete'): void
  (e: 'loopComplete'): void
  (e: 'enterFrame', currentFrame: number): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let lottieInstance: LottieInstance | null = null

const containerStyle = computed(() => {
  const width = typeof props.width === 'number' ? `${props.width}px` : props.width
  const height = typeof props.height === 'number' ? `${props.height}px` : props.height

  return {
    width,
    height,
    ...props.style
  }
})

const lottieOptions = computed<LottieOptions>(() => ({
  loop: props.loop,
  autoplay: props.autoplay,
  speed: props.speed,
  renderer: props.renderer
}))

function initLottie() {
  if (!containerRef.value) return

  if (lottieInstance) {
    lottieInstance.destroy()
    lottieInstance = null
  }

  try {
    const options = lottieOptions.value

    if (props.animationData) {
      const config: AnimationConfigWithData = {
        container: containerRef.value,
        renderer: options.renderer as 'svg',
        loop: options.loop,
        autoplay: options.autoplay,
        animationData: props.animationData,
        rendererSettings: options.rendererSettings
      }
      lottieInstance = lottie.loadAnimation(config) as LottieInstance
    } else if (props.path) {
      const config: AnimationConfigWithPath = {
        container: containerRef.value,
        renderer: options.renderer as 'svg',
        loop: options.loop,
        autoplay: options.autoplay,
        path: props.path,
        rendererSettings: options.rendererSettings
      }
      lottieInstance = lottie.loadAnimation(config) as LottieInstance
    }

    if (lottieInstance) {
      lottieInstance.setSpeed(options.speed ?? 1)
      lottieInstance.container = containerRef.value

      lottieInstance.addEventListener('DOMLoaded', () => {
        emit('ready', lottieInstance!)
      })

      lottieInstance.addEventListener('complete', () => {
        emit('complete')
      })

      lottieInstance.addEventListener('loopComplete', () => {
        emit('loopComplete')
      })

      lottieInstance.addEventListener('enterFrame', (event: { currentTime: number }) => {
        emit('enterFrame', event.currentTime)
      })
    }
  } catch (error) {
    console.error('Failed to load Lottie animation:', error)
  }
}

function play() {
  lottieInstance?.play()
}

function pause() {
  lottieInstance?.pause()
}

function stop() {
  lottieInstance?.stop()
}

function setSpeed(speed: number) {
  lottieInstance?.setSpeed(speed)
}

function goToFrame(frame: number) {
  lottieInstance?.goToAndStop(frame, true)
}

function goToAndPlay(frame: number) {
  lottieInstance?.goToAndPlay(frame, true)
}

watch(() => [props.animationData, props.path, props.loop, props.autoplay, props.speed], () => {
  initLottie()
})

onMounted(() => {
  initLottie()
})

onUnmounted(() => {
  if (lottieInstance) {
    lottieInstance.destroy()
    lottieInstance = null
  }
})

defineExpose({
  play,
  pause,
  stop,
  setSpeed,
  goToFrame,
  goToAndPlay,
  get instance() {
    return lottieInstance
  }
})
</script>

<style scoped>
.lottie-container {
  display: inline-block;
  overflow: hidden;
}
</style>
