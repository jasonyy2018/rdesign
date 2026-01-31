<template>
  <el-dialog
    :model-value="dialogAiOptimizeVisible"
    title="AI简历诊断"
    width="820px"
    append-to-body
    class="custom-dialog"
    @open="handleOpen"
    @close="cancle"
  >
    <div class="ai-content-optimize-dialog">
      <!-- 选择模型 -->
      <div class="content-box">
        <h1 class="title">
          <span>请选择AI模型</span>
        </h1>
      </div>

      <!-- 模型选择器 -->
      <div class="model-selector">
        <el-radio-group v-model="selectedModel" @change="handleModelChange">
          <template v-if="modelList.length > 0">
            <el-radio
              v-for="(item, index) in modelList"
              :key="index"
              :value="item.model_name"
              size="large"
              border
            >
              {{ item.model_name }}
              <span class="free-tag">免费</span>
            </el-radio>
          </template>
        </el-radio-group>
      </div>

      <!-- 历史记录 -->
      <div class="history-optimize-list" @click="handleOpenLogs">
        <svg-icon icon-name="icon-jingji" color="#999999" size="16px"></svg-icon>
        <span>历史诊断记录</span>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button size="default" @click="cancle">取消</el-button>
        <el-button size="default" type="primary" :loading="isSubmitting" @click="submit">
          开始诊断
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 历史诊断记录弹窗 -->
  <ai-optimize-dialog-logs
    :dialog-ai-optimize-visible-logs="dialogAiOptimizeVisibleLogs"
    @cancle="handleCloseLogs"
  />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import {
    getOptimizeResumeIntegralAsync,
    getOptimizeResumeModelListAsync,
    getOptimizeResumeUploadIntegralAsync
  } from '@/http/api/ai';
  import AiOptimizeDialogLogs from './AiOptimizeDialogLogs.vue';

  const emit = defineEmits(['cancle', 'updateSuccess']);

  interface TDialog {
    dialogAiOptimizeVisible: boolean;
    type?: string;
  }

  const props = withDefaults(defineProps<TDialog>(), {
    dialogAiOptimizeVisible: false,
    type: ''
  });

  // 响应式数据
  const selectedModel = ref<string>('');
  const modelList = ref<any>([]);
  const payValue = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const errorMessage = ref<string>('');
  const isSubmitting = ref<boolean>(false);

  // 模型切换
  const handleModelChange = (value: string) => {
    selectedModel.value = value;
  };

  // 弹窗打开
  const handleOpen = async () => {
    try {
      // 查询模型列表
      await Promise.all([
        props.type === 'offline' ? getOptimizeResumeUploadIntegral() : getOptimizeResumeCoin(),
        getOptimizeResumeModelList()
      ]);
    } catch (error) {
      errorMessage.value = '加载失败，请稍后重试';
    } finally {
      isLoading.value = false;
    }
  };

  // 查询上传文件进行AI优化需要的简币数量 (保留接口调用但设为0用于逻辑展示)
  const getOptimizeResumeUploadIntegral = async () => {
    const response = await getOptimizeResumeUploadIntegralAsync();
    if (response.data.status === 200) {
      payValue.value = 0; // 强制设为0
    } else {
      ElMessage.error(response.data.message);
    }
  };

  // 查询AI简历优化需要的简币数量
  const getOptimizeResumeCoin = async () => {
    const response = await getOptimizeResumeIntegralAsync();
    if (response.data.status === 200) {
      payValue.value = 0; // 强制设为0
    } else {
      ElMessage.error(response.data.message);
    }
  };

  // 查询AI简历优化支持的模型列表
  const getOptimizeResumeModelList = async () => {
    try {
      const response = await getOptimizeResumeModelListAsync();
      if (response.data.status === 200) {
        modelList.value = response.data.data;
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      throw new Error('获取模型列表失败');
    }
  };

  // 提交
  const submit = async () => {
    isSubmitting.value = true;
    if (!selectedModel.value) {
      ElMessage.error('请先选择AI模型');
      isSubmitting.value = false;
      return;
    }

    const modelObj = modelList.value.find((item: any) => item.model_name === selectedModel.value);

    emit('updateSuccess', {
      selectedModel: selectedModel.value,
      payValue: 0,
      modelObj
    });
    isSubmitting.value = false;
  };

  // 取消
  const cancle = () => {
    emit('cancle');
  };

  // 打开历史诊断记录弹窗
  const dialogAiOptimizeVisibleLogs = ref<boolean>(false);
  const handleOpenLogs = () => {
    dialogAiOptimizeVisibleLogs.value = true;
  };

  // 关闭历史诊断记录弹窗
  const handleCloseLogs = () => {
    dialogAiOptimizeVisibleLogs.value = false;
  };
</script>

<style lang="scss">
  .custom-dialog {
    border-radius: 24px;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
    background-color: #ffffff;
    overflow: hidden;
    & .el-dialog__header {
      background-color: transparent;
      padding: 24px;
      color: #333333;
      font-size: 24px;
      font-weight: bold;
      border-bottom: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    & .el-dialog__body {
      padding: 24px;
    }
    & .el-dialog__footer {
      background-color: #ffffff;
      padding: 24px;
      border-top: none;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }

  .ai-content-optimize-dialog {
    display: flex;
    flex-direction: column;
    position: relative; /* 为模型选择器定位 */
    .content-box {
      font-size: 12px;
      color: #777777;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      border-bottom: none;
      margin-bottom: 15px;
      .title {
        font-size: 16px;
        color: #009a74;
        position: relative;
        height: 20px;
        display: flex;
        align-items: center;
        margin-left: 10px;
        letter-spacing: 1px;
        &::before {
          content: '';
          position: absolute;
          height: 10px;
          width: 3px;
          background-color: #009a74;
          left: -10px;
        }
      }
    }
    .model-selector {
      width: 100%;
      margin-bottom: 20px;
      .el-radio-group {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    }
    .history-optimize-list {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      padding: 5px 0;
      width: 110px;
      background-color: #fbfbfb;
      font-size: 12px;
      color: #8d8a8a;
      user-select: none;
      &:hover {
        background-color: #eee;
        border-radius: 3px;
        color: green;
      }
      span {
        margin-left: 6px;
      }
    }
    .el-radio {
      display: flex;
      align-items: center;
      margin-bottom: 10px; // 增加间距
      border-radius: 8px; // 圆角
      padding: 10px; // 内边距
      transition: all 0.3s ease; // 过渡效果
      border: 1px solid #dcdfe6; // 默认边框颜色
      margin-right: 0;

      &:hover {
        background-color: #f5f7fa; // 鼠标悬停背景色
        border-color: #4e97fb; // 鼠标悬停边框颜色
      }

      &.is-checked {
        background-color: #e8f4ff; // 选中背景色
        border-color: #4e97fb; // 选中边框颜色

        .el-radio__label {
          color: #4e97fb; // 选中文字颜色
        }
      }

      .el-radio__label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-size: 14px; // 字体大小
        color: #606266; // 默认文字颜色

        .free-tag {
          margin-left: 10px;
          padding: 4px 8px;
          background-color: #e8f5e9; // 免费标签背景色
          color: #4caf50; // 免费标签文字颜色
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
