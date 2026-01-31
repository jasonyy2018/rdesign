<template>
  <footer class="global-footer">
    <!-- 主要内容区域被移除，保持简洁 -->
    <div class="footer-bottom">
      <div class="divider"></div>
      <div class="copyright">
        <p>Copyright © 2026 AI职升姬 All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { getLinksListAsync, getVXQunListUnauthAsync } from '@/http/api/website';

  // 查询微信微信群列表
  const vxQunList = ref<any>([]);
  const getVXQunListUnauth = async () => {
    const data = await getVXQunListUnauthAsync();
    if (data.status === 200) {
      vxQunList.value = data.data;
    } else {
      ElMessage.error(data.message || data.data?.message || '获取微信群列表失败');
    }
  };
  getVXQunListUnauth();

  // 查询友链列表
  const linksList = ref<any>([]);
  const getLinksList = async () => {
    const data = await getLinksListAsync({
      page: 1,
      limit: 20
    });
    if (data.status === 200) {
      linksList.value = data.data.list.filter((item: any) => item.audit === 1);
    } else {
      ElMessage.error(data.message || data.data?.message || '获取友链列表失败');
    }
  };
  getLinksList();

  defineExpose({
    vxQunList,
    linksList
  });
</script>

<style lang="scss" scoped>
  .global-footer {
    background-color: #2a2a2a;
    color: #e0e0e0;
    padding: 40px 0 10px 0;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }

  /* 主要内容区域 - 紧凑布局 */
  .footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 15px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px 15px;
  }

  /* 栏目样式 - 变窄 */
  .footer-section {
    min-width: 150px;
    margin-bottom: 0;
    padding: 0 5px;

    .section-title {
      color: #ffffff;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      position: relative;
      padding-bottom: 5px;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 30px;
        height: 2px;
        background: linear-gradient(90deg, #4caf50, #8bc34a);
      }
    }
  }

  /* 联系我部分 - 解决闪烁问题 */
  .contact-section {
    .qr-codes {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      /* 添加最小高度防止布局跳动 */
      min-height: 120px;
    }

    .qr-item {
      text-align: center;
      /* 固定宽度防止布局变化 */
      width: 100px;
    }

    .qr-image {
      width: 100px;
      height: 100px;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      /* 添加加载占位背景 */
      background: linear-gradient(90deg, #3a3a3a 0%, #2e2e2e 50%, #3a3a3a 100%);
      /* 确保图片比例固定 */
      aspect-ratio: 1/1;
      object-fit: cover;
    }

    .qr-title {
      margin-top: 5px;
      font-size: 14px;
      color: #b0b0b0;
    }
  }

  /* 社交平台部分 - 紧凑布局 */
  .social-section {
    .social-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 8px;
      }

      a {
        display: flex;
        align-items: center;
        color: #b0b0b0;
        text-decoration: none;
        font-size: 14px;

        i {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-right: 6px;
          font-style: normal;
        }

        .icon-bilibili::before {
          content: '📺';
        }

        .icon-juejin::before {
          content: '🔍';
        }

        .icon-zhihu::before {
          content: '❓';
        }
      }
    }
  }

  /* 关联产品部分 - 紧凑布局 */
  .product-section {
    .product-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 8px;
      }

      a {
        display: flex;
        align-items: center;
        color: #b0b0b0;
        text-decoration: none;
        font-size: 14px;

        .icon-product {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-right: 6px;
          font-style: normal;

          &::before {
            content: '🔗';
          }
        }
      }
    }
  }

  /* 站点地图部分 - 紧凑布局 */
  .sitemap-section {
    .sitemap-links {
      list-style: none;
      padding: 0;
      margin: 0;
      li {
        margin-bottom: 8px;
      }
    }

    .sitemap-link {
      display: inline-flex;
      align-items: center;
      color: #b0b0b0;
      text-decoration: none;
      font-size: 14px;

      .icon-sitemap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-right: 6px;
        font-style: normal;

        &::before {
          content: '🗺️';
        }
      }
    }
  }

  /* 友情链接区域 - 紧凑布局 */
  .friend-links-section {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 10px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .friend-links-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
  }

  .friend-links-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .friend-links-title {
    color: #b0b0b0;
    font-size: 14px;
    font-weight: 500;
  }

  .apply-btn {
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #4caf50;
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    .icon-apply::before {
      content: '+';
      font-style: normal;
    }
  }

  .friend-links-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .friend-link {
    color: #8d8d8d;
    font-size: 13px;
    text-decoration: none;
  }

  .link-separator {
    color: #555;
    font-size: 11px;
    user-select: none;
  }

  /* 底部信息 - 紧凑布局 */
  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 15px;
    text-align: center;

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      margin-bottom: 10px;
    }

    .copyright {
      color: #757575;
      font-size: 12px;
      margin-bottom: 5px;
    }

    .icp {
      a {
        color: #757575;
        font-size: 14px;
        text-decoration: none;
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 900px) {
    .footer-section {
      flex: 0 0 calc(50% - 15px);
    }
  }

  @media (max-width: 600px) {
    .footer-content {
      flex-direction: column;
      gap: 15px;
    }

    .footer-section {
      flex: 0 0 100%;
      min-width: 100%;
    }

    .friend-links-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .apply-btn {
      align-self: flex-start;
    }
  }
</style>
