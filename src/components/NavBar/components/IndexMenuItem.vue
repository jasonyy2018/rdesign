<template>
  <el-sub-menu
    v-if="item.children && item.children.length > 0"
    popper-class="navbar-popper-box"
    :index="keyIndex"
    :show-timeout="0"
    :hide-timeout="100"
  >
    <template #title>
      <span>{{ item.title }}</span>
    </template>
    <template v-for="(child, index) in item.children" :key="index">
      <index-menu-item v-if="child.status === 1" :item="child" :key-index="item.name + index" />
    </template>
  </el-sub-menu>
  <template v-else>
    <!-- 统一使用 @click 处理跳转，不依赖 el-menu 的 router 模式 -->
    <el-menu-item :index="item.path" @click="handleMenuClick(item)">{{ item.title }}</el-menu-item>
  </template>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import appStore from '@/store';

  interface MenuItem {
    name: string;
    path: string;
    title: string;
    status: number;
    isRouter: number;
    children?: MenuItem[];
  }

  defineProps({
    item: {
      type: Object as () => MenuItem,
      required: true
    },
    keyIndex: {
      type: String,
      required: true
    }
  });

  const router = useRouter();

  // 统一的菜单点击处理
  const handleMenuClick = (item: { path: string; isRouter: number }) => {
    console.log('Menu clicked:', item.path, 'isRouter:', item.isRouter);

    // 外部链接
    if (item.path.includes('http')) {
      // 职行AI特殊处理
      if (item.path.includes('jobzx')) {
        const { token } = appStore.useTokenStore;
        let id = '';
        if (token) {
          id = appStore.useUserInfoStore.userInfo._id;
        }
        window.open(item.path + '&id=' + id, '_blank', 'noopener,noreferrer');
        return;
      }
      window.open(item.path, '_blank', 'noopener,noreferrer');
    } else {
      // 本地路径使用 Vue Router 跳转
      router.push(item.path);
    }
  };
</script>
<style lang="scss" scoped>
  :deep(.el-menu-item) {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    // 渐变字体
    background: linear-gradient(45deg, #2ddd9d, #137c56) !important; // 自定义渐变颜色
    -webkit-background-clip: text !important; // Safari 和其他 WebKit 浏览器
    background-clip: text !important;
    padding: 0 15px !important;
    letter-spacing: 1px;
    font-size: 16px;
    border-bottom: 4px solid transparent;
    transition: all 0.3s;
    color: transparent;
    font-weight: 550;
    &:hover {
      border-color: #2ddd9d;
      background-color: rgba(#ccc, 0.1);
    }
  }
</style>
