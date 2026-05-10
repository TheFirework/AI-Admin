import { ref, onUnmounted, watch } from 'vue'
import lottie, { type AnimationItem, type RendererType } from 'lottie-web'

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

const defaultOptions: Required<LottieOptions> = {
  loop: true,
  autoplay: true,
  speed: 1,
  renderer: 'svg',
  rendererSettings: {}
}

export function useLottie() {
  const instance = ref<LottieInstance | null>(null)
  const isPlaying = ref(false)

  const loadFromData = (
    container: HTMLElement,
    animationData: object,
    options: LottieOptions = {}
  ): LottieInstance => {
    const mergedOptions = { ...defaultOptions, ...options }

    const config = {
      container,
      renderer: mergedOptions.renderer as 'svg',
      loop: mergedOptions.loop,
      autoplay: mergedOptions.autoplay,
      animationData,
      rendererSettings: mergedOptions.rendererSettings
    }

    const lottieInstance = lottie.loadAnimation(config) as LottieInstance
    lottieInstance.setSpeed(mergedOptions.speed)
    lottieInstance.container = container
    instance.value = lottieInstance

    lottieInstance.addEventListener('DOMLoaded', () => {
      isPlaying.value = mergedOptions.autoplay
    })

    lottieInstance.addEventListener('enterFrame', () => {
      if (instance.value) {
        isPlaying.value = !instance.value.isPaused
      }
    })

    return lottieInstance
  }

  const loadFromPath = (
    container: HTMLElement,
    path: string,
    options: LottieOptions = {}
  ): LottieInstance => {
    const mergedOptions = { ...defaultOptions, ...options }

    const config = {
      container,
      renderer: mergedOptions.renderer as 'svg',
      loop: mergedOptions.loop,
      autoplay: mergedOptions.autoplay,
      path,
      rendererSettings: mergedOptions.rendererSettings
    }

    const lottieInstance = lottie.loadAnimation(config) as LottieInstance
    lottieInstance.setSpeed(mergedOptions.speed)
    lottieInstance.container = container
    instance.value = lottieInstance

    lottieInstance.addEventListener('DOMLoaded', () => {
      isPlaying.value = mergedOptions.autoplay
    })

    lottieInstance.addEventListener('enterFrame', () => {
      if (instance.value) {
        isPlaying.value = !instance.value.isPaused
      }
    })

    return lottieInstance
  }

  const destroy = () => {
    if (instance.value) {
      instance.value.destroy()
      instance.value = null
      isPlaying.value = false
    }
  }

  const pause = () => {
    instance.value?.pause()
    isPlaying.value = false
  }

  const play = () => {
    instance.value?.play()
    isPlaying.value = true
  }

  const setSpeed = (speed: number) => {
    instance.value?.setSpeed(speed)
  }

  const goToFrame = (frame: number) => {
    instance.value?.goToAndStop(frame, true)
  }

  const getTotalFrames = (): number => {
    return instance.value?.totalFrames || 0
  }

  onUnmounted(() => {
    destroy()
  })

  watch(instance, (newInstance, oldInstance) => {
    if (oldInstance && oldInstance !== newInstance) {
      oldInstance.destroy()
    }
  })

  return {
    instance,
    isPlaying,
    loadFromData,
    loadFromPath,
    destroy,
    pause,
    play,
    setSpeed,
    goToFrame,
    getTotalFrames
  }
}

export default useLottie
