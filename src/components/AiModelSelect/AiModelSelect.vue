<template>
  <div class="ai-model-select-cpt">
    <!-- 模型选择器 -->
    <div class="model-selector">
      <h1 class="title"> 请选择AI模型 </h1>
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
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import {
    getGenerateResumeIntegralAsync,
    getGenerateResumeModelListAsync,
    getOptimizeResumeIntegralAsync,
    getOptimizeResumeModelListAsync
  } from '@/http/api/ai';

  const emit = defineEmits(['handleModelChange']);

  interface TProps {
    dialogAiOptimizeVisible?: boolean;
    aiType?: string;
  }

  const props = withDefaults(defineProps<TProps>(), {
    dialogAiOptimizeVisible: false,
    aiType: 'optimizeResume'
  });

  // 响应式数据
  const selectedModel = ref<string>('');
  const modelList = ref<any>([]);
  const payValue = ref<number>(0);
  const modelObj = ref<any>({});

  // 模型切换
  const handleModelChange = (value: string) => {
    selectedModel.value = value;
    modelObj.value = modelList.value.find((item: any) => item.model_name === value);
    emit('handleModelChange', {
      value: value,
      payValue: 0,
      modelObj: modelObj.value
    });
  };

  onMounted(async () => {
    if (props.aiType === 'generateResume') {
      await Promise.all([getGenerateResumeCoin(), getGenerateResumeModelList()]);
    } else {
      await Promise.all([getOptimizeResumeCoin(), getOptimizeResumeModelList()]);
    }
  });

  // 查询AI简历优化需要的简币数量 (设为0)
  const getOptimizeResumeCoin = async () => {
    const response = await getOptimizeResumeIntegralAsync();
    if (response.data.status === 200) {
      payValue.value = 0;
    } else {
      ElMessage.error(response.data.message);
    }
  };

  // 查询AI简历智能生成需要的简币数量 (设为0)
  const getGenerateResumeCoin = async () => {
    const response = await getGenerateResumeIntegralAsync();
    if (response.data.status === 200) {
      payValue.value = 0;
      handleModelChange(selectedModel.value);
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
      console.error('获取模型列表失败', error);
    }
  };

  // 查询AI简历智能生成支持的模型列表
  const getGenerateResumeModelList = async () => {
    try {
      const response = await getGenerateResumeModelListAsync();
      if (response.data.status === 200) {
        modelList.value = response.data.data;
      } else {
        ElMessage.error(response.data.message);
      }
    } catch (error) {
      console.error('获取模型列表失败', error);
    }
  };
</script>
<style lang="scss" scoped>
  .ai-model-select-cpt {
    display: flex;
    flex-direction: column;
    position: relative;
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
    .model-selector {
      width: 100%;
      margin-bottom: 20px;
    }
    .el-radio-group {
      margin: 20px 0 0 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .el-radio {
      display: flex;
      align-items: center;
      border-radius: 8px;
      padding: 10px;
      transition: all 0.3s ease;
      border: 1px solid #dcdfe6;
      margin-right: 0;
      min-width: 160px;

      &:hover {
        background-color: #f5f7fa;
        border-color: #4e97fb;
      }

      &.is-checked {
        background-color: #e8f4ff;
        border-color: #4e97fb;

        .el-radio__label {
          color: #4e97fb;
        }
      }

      :deep(.el-radio__label) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-size: 14px;
        color: #606266;

        .free-tag {
          margin-left: 10px;
          padding: 4px 8px;
          background-color: #e8f5e9;
          color: #4caf50;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      }
    }
  }
</style>
