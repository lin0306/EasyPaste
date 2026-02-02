<template>
  <nav class="navbar">
    <ul class="nav-menu">
      <li
          v-for="item in menus"
          :key="item.key"
          class="nav-item"
          @mouseenter="handleMouseEnter(item, $event)"
          @mouseleave="handleMouseLeave"
      >
        {{ item.label }}

        <!-- 二级菜单 -->
        <transition name="slide-fade" :css="animationEffect.enabled">
          <ul
              v-if="item.children && activeMenu === item.key"
              class="dropdown-menu"
              :style="dropdownStyle"
          >
            <li
                v-for="child in item.children"
                :key="child.key"
                class="dropdown-item"
                @click="child.onClick"
            >
              <div v-if="child.type === 'divider'" class="divider"/>
              <div v-else-if="child.type === 'radio'" @click="child.onClick" class="dropdown-link">
                {{ child.label }}
                <font-awesome-icon icon="fa-solid fa-check" v-if="child.isCheck" :color="themeColors.universal.text"
                                   class="checked-icon"/>
                <div v-else class="unchecked-icon"></div>
              </div>
              <div v-else class="dropdown-link">{{ child.label }}</div>
            </li>
          </ul>
        </transition>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {animationEffect} from "./composables/AnimationComposable.ts";
import {themeColors} from "../services/ThemeService.ts";

const props = defineProps<{
  menuItems: NavBarItem[];
}>();


/**
 * 菜单项
 */
const menus = computed(() => {
  // 过滤掉isHide为true的菜单项
  return props.menuItems.filter(item => !item.isHide).map(item => {
    // 如果有子菜单，也需要过滤子菜单中isHide为true的项
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: item.children.filter(child => !child.isHide)
      };
    }
    return item;
  });
});

// 状态管理
const activeMenu = ref<string>('')
const dropdownStyle = ref({})

// 处理鼠标进入事件
const handleMouseEnter = (menuItem: NavBarItem, event: any) => {
  const hasChildren = menuItem.children;
  if (hasChildren) {
    activeMenu.value = menuItem.key;

    // 计算下拉菜单位置
    const navItem = event.target.closest('.nav-item')
    if (navItem) {
      const rect = navItem.getBoundingClientRect()
      dropdownStyle.value = {
        left: `${rect.left}px`,
        top: `${rect.bottom}px`
      }
    }
  }
}

// 处理鼠标离开事件
const handleMouseLeave = () => {
  activeMenu.value = ''
}
</script>

<style scoped>
.navbar {
  background-color: var(--theme-menu-background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
  position: sticky;
  top: 0;
  z-index: 1000;
  font-size: 12px;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
  padding: 3px 5px;
  display: block;
  color: var(--theme-universal-text);
  text-decoration: none;
  transition: all var(--animation-duration, 0.3s) ease;
}

.nav-item:hover {
  background-color: var(--theme-menu-itemHover);
}

.dropdown-menu {
  position: fixed;
  background-color: var(--theme-universal-secondary);
  box-shadow: 0 8px 16px rgba(0, 0, 0, .1);
  list-style: none;
  padding: 5px 0;
  border-radius: 4px;
}

.dropdown-item {
  padding: 0;
}

.dropdown-link {
  display: flex;
  padding: 4px 10px;
  color: var(--theme-universal-text);
  text-decoration: none;
  transition: background-color var(--animation-duration, 0.3s);
}

.dropdown-link:hover {
  background-color: var(--theme-menu-itemHover);
}

.divider {
  height: 1px;
  background-color: var(--theme-universal-border);
}

.checked-icon {
  width: 14px;
  height: 14px;
  margin-left: 10px;
  display: inline-block;
  vertical-align: middle;
}

.unchecked-icon {
  width: 14px;
  height: 14px;
  margin-left: 10px;
  display: inline-block;
  vertical-align: middle;
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all var(--animation-duration, 0.3s) ease-out;
}

.slide-fade-leave-active {
  transition: all var(--animation-duration, 0.3s) cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>