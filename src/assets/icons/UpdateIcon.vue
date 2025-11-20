<template>
  <svg t="1755768190322" class="icon" viewBox="0 0 2624 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
       p-id="8232"
       width="512.5" height="200">
    <path
        d="M2491.26528 0C2564.48128 0 2624.00128 61.76 2624.00128 137.92v620.672c0 36.608-14.016 71.68-38.848 97.536a130.24 130.24 0 0 1-93.888 40.384H507.77728L224.00128 1024l18.368-127.488H132.73728c-35.2 0-68.992-14.528-93.888-40.384A140.736 140.736 0 0 1 0.00128 758.592V137.92C0.00128 61.76 59.45728 0 132.73728 0h2358.528z"
        fill="#bf242a"></path>
    <text
        x="1300"
        y="40"
        font-size="700"
        fill="white"
        font-family="Arial, sans-serif"
        text-anchor="middle"
        dominant-baseline="text-before-edge"
        font-weight="700"
    >
      {{currentLanguage.pages.list.updateTxt}}
    </text>
  </svg>
</template>
<script lang="ts" setup>
import {currentLanguage} from "../../services/LanguageService.ts";
</script>
<style>
svg {
  width: 100%;
  height: 100%;
}
</style>