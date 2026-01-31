<!-- 首页标题栏 -->
<template>
  <div :class="['nav-bar-box', { 'background-nav': props.bgColor ? true : false }]">
    <logo-com></logo-com>
    <div v-config:open_homne_menu class="center">
      <el-menu
        :default-active="route.path"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        :popper-offset="10"
      >
        <template v-for="(item, index) in indexMenuList" :key="index">
          <!-- 只显示启用中的 -->
          <index-menu-item v-if="item.status === 1" :item="item" :key-index="item.name + index" />
        </template>
        <el-menu-item @click="toSeoArticles">求职百科</el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <!-- 移除所有用户、会员、简币和签到相关元素 -->
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import appStore from '@/store';
  import { storeToRefs } from 'pinia';

  interface IBgcColor {
    bgColor?: string;
    fontColor?: string;
    position?: string;
    iconColor?: string;
  }
  const route = useRoute();
  const props = withDefaults(defineProps<IBgcColor>(), {
    bgColor: '',
    fontColor: '',
    iconColor: '#fff',
    position: 'fixed'
  });

  // 查询首页导航菜单
  const { getIndexMenuList } = appStore.useIndexMenuStore;
  getIndexMenuList();

  // 菜单列表
  const { indexMenuList } = storeToRefs(appStore.useIndexMenuStore);

  const router = useRouter();

  // 跳转至SEO文章页
  const toSeoArticles = () => {
    router.push('/seo-articles');
  };
</script>
<style lang="scss" scoped>
  .background-nav {
    // 增强毛玻璃效果
    backdrop-filter: blur(16px); // 增加模糊强度
    -webkit-backdrop-filter: blur(12px); // Safari 和其他 WebKit 浏览器
    background-color: rgba(255, 255, 255, 0.5); // 半透明背景（浅色）
    // background-color: rgba(0, 0, 0, 0.3); // 半透明背景（深色）

    // 备用背景颜色（如果浏览器不支持毛玻璃效果）
    @supports not (backdrop-filter: blur(12px)) {
      background-color: v-bind('props.bgColor');
    }
  }
  .nav-bar-box {
    display: flex;
    height: 65px;
    width: 100%;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
    z-index: 10;
    user-select: none;
    padding: 0 20px 0 30px;
    position: v-bind('props.position');
    top: 0;
    transition: all 0.3s;

    .center {
      flex: 1;
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-left: 2vw;
      .el-menu {
        border: none;
        height: 100%;
        background-color: rgba(255, 255, 255, 0);
        display: flex;
        justify-content: center;
        align-items: center;
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
        .el-sub-menu {
          height: 100%;
          // 渐变字体
          background: linear-gradient(45deg, #2ddd9d, #137c56); // 自定义渐变颜色
          -webkit-background-clip: text; // Safari 和其他 WebKit 浏览器
          background-clip: text;
          border-bottom: 4px solid transparent;
          width: 130px;
          color: transparent;
          font-weight: 550;
          &:hover {
            border-bottom: 4px solid #2ddd9d !important;
            background-color: rgba(#ccc, 0.1);
          }
          :deep(.el-sub-menu__title) {
            letter-spacing: 1px;
            font-size: 16px;
            // 渐变字体
            background: linear-gradient(45deg, #2ddd9d, #137c56); // 自定义渐变颜色
            -webkit-background-clip: text; // Safari 和其他 WebKit 浏览器
            background-clip: text;
            border: none;
            color: transparent;
            font-weight: 550;
            &:hover {
              background-color: rgba(#ccc, 0.1);
            }
            .el-sub-menu__icon-arrow {
              color: #21a474;
            }
          }
        }
        .is-active {
          background-color: rgba(255, 255, 255, 0);
          // color: #21a474;
          border-bottom: 4px solid #2ddd9d !important;
        }
      }
    }
    .right {
      display: flex;
      align-items: center;
      .contact-me {
        cursor: pointer;
        margin-right: 15px;
        font-size: 14px;
        color: v-bind('props.iconColor');
      }
      .svg-icon {
        cursor: pointer;
      }

      .get-source-code {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 10px;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
          opacity: 0.9;
        }
        .content-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 10px;
          background-color: #83ffd1;
          border-radius: 15px;
          font-size: 13px;
          span {
            font-size: 12px;
            letter-spacing: 1px;
            color: #617745;
            margin: 2px 0 0 4px;
          }
          .svg-icon {
            margin-right: 5px;
          }
        }
        .expiredDays {
          background-color: #3b7962;
          span {
            color: rgb(237, 218, 218);
          }
        }
      }
    }
  }
</style>
<style lang="scss">
  .navbar-popper-box {
    // overflow: hidden;
    border: none;
    border-radius: 0;

    .el-menu {
      padding: 0;
      min-width: 130px;
      .el-menu-item {
        height: 50px;
        font-size: 14px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 1px;
        // 渐变字体
        background: linear-gradient(45deg, #2ddd9d, #137c56); // 自定义渐变颜色
        -webkit-background-clip: text; // Safari 和其他 WebKit 浏览器
        background-clip: text;
      }
      .el-sub-menu {
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        // 渐变字体
        background: linear-gradient(45deg, #2ddd9d, #137c56); // 自定义渐变颜色
        -webkit-background-clip: text; // Safari 和其他 WebKit 浏览器
        background-clip: text;
        padding: 0 15px !important;
        letter-spacing: 1px;
        font-size: 16px;
        border-bottom: 4px solid transparent;
        transition: all 0.3s;
        color: transparent;
        font-weight: 550;
        &:hover {
          background-color: rgba(#ccc, 0.1);
        }
        :deep(.el-sub-menu__title) {
          letter-spacing: 1px;
          font-size: 16px;
          // 渐变字体
          background: linear-gradient(45deg, #2ddd9d, #137c56); // 自定义渐变颜色
          -webkit-background-clip: text; // Safari 和其他 WebKit 浏览器
          background-clip: text;
          border: none;
          color: transparent;
          font-weight: 550;
          &:hover {
            background-color: rgba(#ccc, 0.1);
          }
          .el-sub-menu__icon-arrow {
            color: #21a474;
          }
        }
      }
    }
  }

  // 开通会员浮窗
  .create-membership-popper {
    width: 260px !important;
    padding: 15px 5px 0 5px !important;
    border-radius: 12px;
    .create-membership-pop-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      .member-goods-item {
        width: 235px;
        height: 150px;
        border-radius: 12px;
        background-repeat: no-repeat;
        background-size: cover;
        position: relative;
        cursor: pointer;
        transition: all 0.3s;
        flex-shrink: 0;
        margin-bottom: 15px;
        padding: 10px 15px;
        img {
          width: 94px;
          height: 94px;
          position: absolute;
          right: 16px;
          top: 14px;
          z-index: 1;
        }
        .info-container {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          .goods-name {
            font-size: 15px;
            font-weight: 600;
            line-height: 28px;
            display: flex;
            align-items: center;
            z-index: 10;
            img {
              width: 22px;
              height: auto;
              margin-right: 5px;
              position: inherit;
              margin-bottom: 2px;
            }
          }
          .goods-tips {
            flex: 1;
            font-size: 12px;
            color: #333;
            margin: 5px 0 10px 0;
          }
          .price-desc {
            font-size: 12px;
            letter-spacing: 1px;
            font-weight: 400;
            color: #72511d !important;
            background: linear-gradient(270deg, #ada48a, #eae5b7 45%, #f5efd6);
            width: fit-content;
            padding: 2px 10px;
            border-radius: 40px;
            box-shadow: 0 0 10px rgba(26, 22, 15, 0.3);
            transition: all 0.3s;
            &:hover {
              opacity: 0.8;
            }
          }
          .name-monthly {
            background: linear-gradient(70.95deg, #3974af 29.76%, #2d537a 71.28%);
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .name-yearly {
            background: linear-gradient(83.16deg, #af764c 19.01%, #774d26 88.14%);
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .name-lifetime {
            background: linear-gradient(83.16deg, #4c50af 19.01%, #3b2677 88.14%);
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .desc-monthly {
            color: #6face1;
          }
          .desc-yearly {
            color: #c99b68;
          }
          .desc-lifetime {
            color: #746dbb;
          }
        }
      }
      .active {
        border: 1.5px solid #2d537a;
      }
      .monthly {
        background-image: url(@/assets/images/membership/membership-monthly.png);
      }
      .yearly {
        background-image: url(@/assets/images/membership/membership-yearly.png);
      }
      .lifetime {
        background-image: url(@/assets/images/membership/membership-lifetime.png);
      }
    }
  }
</style>
