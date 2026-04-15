<script setup lang="ts">
import { animationEffect } from './composables/AnimationComposable.ts'

const isShow = (effect: string) => {
  if (!animationEffect.enabled) {
    return false
  }
  if (animationEffect.backgroundAnimationEffect === effect) {
    return true
  }
}
</script>

<template>
  <star-background v-if="isShow('star')" />
  <orb-background v-if="isShow('orb')" />
  <aurora-background v-if="isShow('aurora')" />
  <ember-background v-if="isShow('ember')" />
  <starry-sky-background v-if="isShow('starry-sky')" />
</template>

<style scoped></style>
