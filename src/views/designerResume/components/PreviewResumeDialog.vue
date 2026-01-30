<template>
  <el-dialog
    :model-value="dialogPreviewResumeVisible"
    title="导出PDF预览（如和设计页面有差异，请调整各模块边距后再导出）"
    width="860px"
    :show-close="true"
    :close-on-click-modal="false"
    append-to-body
    class="pdf-preview-dialog-container"
    @close="cancle"
    @open="handleOpen"
  >
    <div class="pdf-preview-dialog">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <el-progress :percentage="progressPercent" :stroke-width="8" :format="progressFormat" />
        <span>{{ statusText }}</span>
        <p class="loading-tip">小贴士：PDF生成时间取决于简历复杂度和网络状况</p>
      </div>

      <!-- PDF 预览区域 -->
      <div v-if="pdfUrl && !loading" class="pdf-viewer-container">
        <template v-for="page in pageCount" :key="page">
          <vue-pdf-embed :source="pdfUrl" :page="page" class="vue-pdf-embed" />
        </template>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <el-alert
          title="生成预览失败"
          type="error"
          :description="error"
          show-icon
          closable
          @close="error = ''"
        />
        <div class="error-actions">
          <el-button @click="handleOpen">重试</el-button>
          <el-button type="primary" @click="handleBrowserPrint">直接导出 (浏览器打印)</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Loading } from '@element-plus/icons-vue';
  import VuePdfEmbed from 'vue-pdf-embed';
  import { exportPdfPreview } from '@/utils/pdf';
  import { useRoute } from 'vue-router';

  const emit = defineEmits(['cancle', 'updateSuccess']);

  interface TDialog {
    dialogPreviewResumeVisible: boolean;
  }

  const props = withDefaults(defineProps<TDialog>(), {
    dialogPreviewResumeVisible: false
  });

  const route = useRoute();
  const loading = ref(false);
  const error = ref('');
  const pdfUrl = ref('');
  const currentPage = ref(1);
  const pageCount = ref(0);
  const progressPercent = ref(0);
  const progressInterval = ref<any>(null);

  // 直接使用浏览器打印
  const handleBrowserPrint = () => {
    window.print();
  };

  // 取消
  const cancle = () => {
    // 清理资源
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value);
      pdfUrl.value = '';
    }
    emit('cancle');
  };

  // 进度条格式化
  const progressFormat = () => {
    return `正在处理 ${progressPercent.value}%`;
  };

  const statusText = ref('正在为您生成高清预览，可能需要10-30秒，请耐心等待...');

  // 打开弹窗时加载PDF
  const handleOpen = async () => {
    try {
      loading.value = true;
      error.value = '';
      currentPage.value = 1;
      pageCount.value = 0;
      progressPercent.value = 0;
      statusText.value = '正在为您生成高清预览，可能需要10-30秒，请耐心等待...';

      // 启动改进后的模拟进度
      progressInterval.value = setInterval(() => {
        if (progressPercent.value < 85) {
          // 前段：较快
          progressPercent.value += Math.floor(Math.random() * 3) + 2;
        } else if (progressPercent.value < 95) {
          // 中段：逐渐减慢
          progressPercent.value += 1;
          statusText.value = '进度稍慢，服务器正在全力渲染中...';
        } else if (progressPercent.value < 99) {
          // 后段：极慢，暗示仍在工作中
          if (Math.random() > 0.7) {
            progressPercent.value += 1;
          }
          statusText.value = '即将完成，正在进行最后的高清校验...';
        }
      }, 800);

      // 清理之前的PDF
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = '';
      }

      // 获取PDF Blob (增加 120s 超时控制)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('预览生成超时，可能是当前简历过于复杂或服务器繁忙。')),
          120000
        )
      );

      const data: any = await Promise.race([
        exportPdfPreview(route.params.id as string),
        timeoutPromise
      ]);

      if (data && data.blob) {
        // 创建对象URL用于预览
        pdfUrl.value = URL.createObjectURL(data.blob);
        pageCount.value = data.pageCount;
      } else {
        throw new Error('未能获取PDF内容，请稍后重试');
      }
    } catch (err) {
      console.error('生成预览出错:', err);
      error.value = err instanceof Error ? err.message : String(err);
      if (error.value.includes('超时')) {
        error.value += ' 建议直接点击“导出”使用浏览器打印功能。';
      }
    } finally {
      if (progressInterval.value) {
        clearInterval(progressInterval.value);
        progressInterval.value = null;
      }
      if (!error.value) {
        progressPercent.value = 100;
        setTimeout(() => {
          loading.value = false;
        }, 300);
      } else {
        loading.value = false;
      }
    }
  };
</script>

<style lang="scss">
  .pdf-preview-dialog-container {
    .el-dialog__body {
      padding: 30px 15px;
    }
    .pdf-preview-dialog {
      min-height: 300px;
      display: flex;
      flex-direction: column;

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        gap: 16px;

        .el-icon {
          font-size: 24px;
          animation: rotating 2s linear infinite;
        }

        .el-progress {
          width: 80%;
        }

        .loading-tip {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 8px;
        }
      }

      .pdf-viewer-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 820px;

        .vue-pdf-embed {
          border-radius: 6px;
          overflow: hidden;
          min-height: 500px;
          box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
        }
      }

      .page-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        padding: 8px 0;

        .page-info {
          min-width: 120px;
          text-align: center;
        }
      }

      .preview-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid #eee;
      }

      .error-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;

        .el-alert {
          width: 100%;
        }

        .error-actions {
          display: flex;
          gap: 12px;
        }
      }
    }

    @keyframes rotating {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }
</style>
