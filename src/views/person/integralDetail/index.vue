<template>
  <div class="my-integral-box">
    <div class="free-notice-box">
      <h1>全站功能已全面开放</h1>
      <p>为了回馈广大用户，我们已移除所有积分和会员限制。</p>
      <p>现在，您可以免费享用所有简历模板、AI诊断、AI简历生成以及文件导出功能。</p>
      <div class="icons-list">
        <div class="icon-item">
          <el-icon size="40"><DocumentChecked /></el-icon>
          <span>免费模版</span>
        </div>
        <div class="icon-item">
          <el-icon size="40"><Cpu /></el-icon>
          <span>AI驱动</span>
        </div>
        <div class="icon-item">
          <el-icon size="40"><Download /></el-icon>
          <span>无限导出</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { DocumentChecked, Cpu, Download } from '@element-plus/icons-vue';
</script>

<style lang="scss" scoped>
  .my-integral-box {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background-color: #fff;
    border-radius: 10px;
    padding: 40px;
    .free-notice-box {
      text-align: center;
      h1 {
        font-size: 28px;
        color: #009a74;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        color: #666;
        line-height: 1.8;
      }
      .icons-list {
        display: flex;
        justify-content: center;
        gap: 60px;
        margin-top: 50px;
        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #8e6cf7;
          span {
            margin-top: 10px;
            font-size: 14px;
            color: #333;
          }
        }
      }
    }
  }
</style>
