<template>
  <div class="membership-box">
    <div class="free-notice-container">
      <div class="notice-card">
        <el-icon size="60" color="#8e6cf7"><CircleCheckFilled /></el-icon>
        <h1>会员功能现已全面免费</h1>
        <p class="subtitle">感谢您一直以来的支持！</p>
        <div class="description">
          <p>为了让更多用户能够无障碍地提升职场竞争力，我们决定：</p>
          <ul>
            <li>移除所有简历模版的下载限制</li>
            <li>开放所有 AI 智能诊断功能</li>
            <li>免费提供 AI 智能简历生成服务</li>
            <li>取消所有积分消费机制</li>
          </ul>
        </div>
        <el-button type="primary" size="large" round @click="goHome">立即开始创作</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { CircleCheckFilled } from '@element-plus/icons-vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const goHome = () => {
    router.push('/');
  };
</script>

<style lang="scss" scoped>
  .membership-box {
    width: 100vw;
    min-height: calc(100vh - 65px);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;

    .free-notice-container {
      width: 100%;
      max-width: 800px;
      .notice-card {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 60px 40px;
        border-radius: 30px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;

        h1 {
          font-size: 32px;
          color: #333;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 18px;
          color: #8e6cf7;
          font-weight: 500;
          margin-bottom: 30px;
        }

        .description {
          text-align: left;
          background: #f8f9fa;
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 40px;
          width: 100%;
          max-width: 500px;

          p {
            font-weight: 600;
            color: #444;
            margin-bottom: 15px;
          }

          ul {
            list-style: none;
            padding: 0;
            li {
              position: relative;
              padding-left: 25px;
              margin-bottom: 12px;
              color: #666;
              &:before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #00c090;
                font-weight: bold;
              }
            }
          }
        }

        .el-button {
          padding: 15px 40px;
          font-size: 18px;
        }
      }
    }
  }
</style>
