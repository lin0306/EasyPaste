<template>
  <div class="custom-navbar">
    <!-- 主菜单 -->
    <ul class="navbar-menu">
      <li v-for="item in menus" :key="item.key"
          class="navbar-item"
          :class="{ 'has-submenu': item.children,'active':item.key === activeMenuItem }"
          @click="handleMenuClick(item)"
          :data-key="item.key"
      >
        <div class="navbar-link">
          {{ item.label }}
        </div>
      </li>
    </ul>
    <!-- 子菜单 -->
    <transition-group name="sub-menu-list" :css="animationEffect.enabled">
      <div v-if="activeMenuItem && subMenuItems && subMenuItems.length > 0"
           class="submenu"
           ref="submenuRef"
           :style="{ left: submenuLeft + 'px' }">
        <ul>
          <template v-for="(subItem, _index) in subMenuItems" :key="subItem.key">
            <li v-if="subItem.type === 'divider'" class="divider"/>
            <li v-if="subItem.type === 'theme'" class="submenu-item">
              <a @click="handleSubMenuClick(subItem)" class="submenu-link">
                <HookIcon v-if="subItem.isCurrentTheme" :color="themeColors.primary" class="checked-icon"/>
                <div v-else class="unchecked-icon"></div>
                {{ subItem.label }}
              </a>
            </li>
            <li v-else class="submenu-item">
              <a @click="handleSubMenuClick(subItem)" class="submenu-link">
                {{ subItem.label }}
              </a>
            </li>
          </template>
        </ul>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref} from 'vue';
import HookIcon from '../assets/icons/HookIcon.vue';
import {useTheme} from '../services/ThemeService.ts';
import {animationEffect} from "../pages/list/composables/AnimationComposable.ts";

const {themeColors} = useTheme();

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

/**
 * 选中的主菜单项
 */
const activeMenuItem = ref('');
/**
 * 当前展示的子菜单项
 */
const subMenuItems = ref<NavBarItem[]>([]);
const submenuRef = ref<HTMLElement | null>(null);
const submenuLeft = ref(0);

/**
 * 处理主菜单点击
 * @param item 菜单项
 */
function handleMenuClick(item: NavBarItem) {
  if (item.children && item.children.length > 0) {
    if (activeMenuItem.value === item.key) {
      activeMenuItem.value = '';
      subMenuItems.value = [];
    } else {
      subMenuItems.value = item.children;
      activeMenuItem.value = item.key || '';
      nextTick(() => {
        calculateSubmenuPosition(activeMenuItem.value);
      })
    }
  } else {
    // 如果存在onClike方法，则调用
    if (item.onClick) {
      item.onClick();
    }
    activeMenuItem.value = '';
  }
}

/**
 * 计算子菜单位置
 * @param menuKey 菜单项的key
 */
function calculateSubmenuPosition(menuKey: string | null) {
  console.log('menuKey', menuKey)
  if (!menuKey) return;

  const menuItemElement = document.querySelector(`.navbar-item[data-key="${menuKey}"]`);
  if (menuItemElement && submenuRef.value) {
    const rect = menuItemElement.getBoundingClientRect();
    const submenuRect = submenuRef.value.getBoundingClientRect();

    // 默认位置为菜单项左侧
    let leftPos = rect.left;

    // 检查右侧是否足够显示子菜单
    if (leftPos + submenuRect.width > window.innerWidth) {
      // 如果不够，向左调整
      leftPos = window.innerWidth - submenuRect.width - 10;
    }

    // 确保不会超出左边界
    submenuLeft.value = Math.max(5, leftPos);
    console.log('submenuLeft', submenuLeft.value)
  }
}

/**
 * 处理子菜单点击
 * @param item 子菜单项
 */
function handleSubMenuClick(item: NavBarItem) {
  // 如果存在onClike方法，则调用
  if (item.onClick) {
    item.onClick();
  }
  activeMenuItem.value = '';
}

/**
 * 点击外部关闭子菜单
 * @param event 点击事件对象
 */
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.navbar-item.has-submenu')) {
    activeMenuItem.value = '';
    subMenuItems.value = [];
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.custom-navbar {
  width: 98%;
  z-index: 10000;
  font-size: 12px;
  padding: 0 1%;
  position: relative;
}

.navbar-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 30px;
  line-height: 30px;
  background-color: var(--theme-menu-background);
  border-bottom: 1px solid var(--theme-universal-border);
}

.navbar-item {
  display: inline-block;
  padding: 0 7px;
  cursor: pointer;
  border-radius: 5px;
  margin: 2px;
  height: 25px;
  width: auto;
  transition: background-color var(--animation-duration, 0.3s) ease;
}

.navbar-item:hover {
  background-color: var(--theme-menu-itemHover);
}

.navbar-item.active {
  background-color: var(--theme-menu-itemActive) !important;
}

.navbar-link {
  height: 25px;
  line-height: 25px;
}

.submenu {
  width: fit-content;
  max-height: calc(100vh - 100px);
  background-color: var(--theme-cardBackground);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
  z-index: 1050;
  white-space: nowrap;
  transition: opacity var(--animation-duration, 0.3s) ease;
  position: fixed;
  margin-top: 2px;
}

.submenu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.submenu-item {
  padding: 0;
  margin: 0;
}

.checked-icon {
  width: 14px;
  height: 14px;
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
}

.unchecked-icon {
  width: 14px;
  height: 14px;
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
}

.submenu-link {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: var(--theme-universal-text);
  text-decoration: none;
  transition: background-color 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 24px;
}

.submenu-link:hover {
  background-color: var(--theme-hoverBackground);
}

.divider {
  height: 1px;
  background-color: var(--theme-divider);
}


/*内容列表动画效果start*/
/* 进入动画 - 显示 */
.sub-menu-list-enter-from {
  opacity: 0;
}

.sub-menu-list-enter-to {
  opacity: 1;
}

/* 离开动画 - 隐藏 */
.sub-menu-list-leave-from {
  opacity: 1;
}

.sub-menu-list-leave-to {
  opacity: 0;
}

/* 离开中 */
.sub-menu-list-leave-active {
  position: fixed;
}

/*内容列表动画效果end*/
</style>