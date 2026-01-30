<template>
  <div class="seo-articles-container">
    <nav-bar-vue></nav-bar-vue>
    <div class="content-wrapper">
      <header class="header">
        <h1>职场提升与简历优化指南</h1>
        <p>助您精准定位职业方向，打造满分简历</p>
      </header>

      <div class="articles-grid">
        <el-card
          v-for="article in SEO_ARTICLES"
          :key="article.id"
          class="article-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <span class="title">{{ article.title }}</span>
              <el-tag size="small" type="info">{{ article.date }}</el-tag>
            </div>
          </template>
          <p class="summary">{{ article.summary }}</p>
          <div class="tags">
            <el-tag v-for="tag in article.tags" :key="tag" size="small" class="tag">{{
              tag
            }}</el-tag>
          </div>
          <el-button type="primary" link @click="showContent(article)">阅读全文</el-button>
        </el-card>
      </div>

      <!-- 文章详情弹窗 -->
      <el-dialog v-model="dialogVisible" :title="currentArticle.title" width="60%">
        <div class="article-detail">
          <div class="meta">
            <span>发布日期: {{ currentArticle.date }}</span>
            <div class="detail-tags">
              <el-tag v-for="tag in currentArticle.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="main-content">
            {{ currentArticle.content }}
          </div>
        </div>
      </el-dialog>
    </div>
    <footer-com-vue></footer-com-vue>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { SEO_ARTICLES } from './articlesData';
  import NavBarVue from '@/components/NavBar/NavBar.vue';
  import FooterComVue from '@/components/FooterCom/FooterCom.vue';

  const dialogVisible = ref(false);
  const currentArticle = ref<any>({});

  const showContent = (article: any) => {
    currentArticle.value = article;
    dialogVisible.value = true;
  };
</script>

<style scoped lang="scss">
  .seo-articles-container {
    background-color: #f5f7fa;
    min-height: 100vh;

    .content-wrapper {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;

      .header {
        text-align: center;
        margin-bottom: 50px;
        h1 {
          font-size: 32px;
          color: #303133;
          margin-bottom: 10px;
        }
        p {
          color: #606266;
          font-size: 16px;
        }
      }

      .articles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 25px;
        margin-bottom: 50px;

        .article-card {
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title {
              font-weight: bold;
              font-size: 16px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 70%;
            }
          }
          .summary {
            font-size: 14px;
            color: #606266;
            line-height: 1.6;
            margin-bottom: 15px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .tags {
            margin-bottom: 15px;
            .tag {
              margin-right: 8px;
            }
          }
        }
      }
    }

    .article-detail {
      .meta {
        margin-bottom: 20px;
        color: #909399;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .main-content {
        line-height: 1.8;
        font-size: 15px;
        color: #303133;
        white-space: pre-wrap;
      }
    }
  }
</style>
