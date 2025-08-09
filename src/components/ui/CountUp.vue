<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  start: {
    type: Number,
    default: 0
  },
  end: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 2000
  },
  delay: {
    type: Number,
    default: 0
  }
})

const displayValue = ref(props.start)

const animateValue = () => {
  const startTime = Date.now()
  const endTime = startTime + props.duration
  const range = props.end - props.start

  const updateValue = () => {
    const now = Date.now()
    const remaining = Math.max(endTime - now, 0)
    const progress = 1 - remaining / props.duration
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    
    displayValue.value = Math.round(props.start + range * easeOutQuart)

    if (remaining > 0) {
      requestAnimationFrame(updateValue)
    } else {
      displayValue.value = props.end
    }
  }

  setTimeout(() => {
    requestAnimationFrame(updateValue)
  }, props.delay)
}

onMounted(() => {
  animateValue()
})

watch(() => props.end, () => {
  animateValue()
})
</script>