<!-- ai帮写弹窗 -->
<template>
  <el-dialog
    :model-value="dialogTranslateVisible"
    title="请选择需要转换成的语种"
    width="420px"
    :show-close="false"
    :close-on-click-modal="false"
    append-to-body
  >
    <div
      v-loading="aiLoading"
      class="ai-content-translate-select-warpper"
      element-loading-text="AI拼命翻译中~"
    >
      <p class="tips"
        ><b>注意：</b
        >此操作AI会将您的简历内容翻译为对应语种，无法确保完全正确，请你最好留有数据备份！</p
      >
      <el-form size="default">
        <el-form-item label="选择AI模型:">
          <el-select
            v-model="selectedModel"
            placeholder="请选择AI模型"
            size="default"
            style="width: 100%"
          >
            <el-option
              v-for="item in modelList"
              :key="item._id"
              :label="item.model_name"
              :value="item.model_name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择目标语种:">
          <el-select v-model="language" placeholder="请选择语种" size="default" style="width: 100%">
            <el-option
              v-for="item in languageList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="default" @click="cancle">取消</el-button>
        <el-button size="default" type="primary" :loading="aiLoading" @click="submit">{{
          aiLoading ? '翻译中' : '开始翻译'
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import {
    cancleAiTranslateTextAsync,
    getSerialNumberAsync,
    translateTextAsync,
    aiModelListAsync // Import model list
  } from '@/http/api/ai';
  import { ElNotification } from 'element-plus';
  import { extractValues, parseJSON, restoreValues } from '@/utils/jsonUtils';
  import { useGetSelectedModule } from '../hooks/useGetSelectedModule';

  const emit = defineEmits(['cancle', 'updateSuccess']);
  interface TDialog {
    dialogTranslateVisible: boolean;
    id: string;
  }
  const props = withDefaults(defineProps<TDialog>(), {
    dialogTranslateVisible: false,
    id: ''
  });

  const selectedModel = ref<string>('');
  const modelList = ref<any>([]);

  // 获取模型列表
  const getModelList = async () => {
    const res = await aiModelListAsync();
    if (res.data.status === 200) {
      modelList.value = res.data.data;
      // 增加 Cerebras 选项
      modelList.value.unshift({
        _id: 'cerebras-qwen-translate',
        model_name: 'Cerebras-Qwen-Translate',
        model_is_free: 1
      });
      if (modelList.value.length > 0) {
        selectedModel.value = modelList.value[0].model_name;
      }
    }
  };

  watch(
    () => props.dialogTranslateVisible,
    async (newVal) => {
      if (newVal) {
        aiLoading.value = false;
        const module = useGetSelectedModule(props.id);
        if (!module) {
          console.error('Module not found for id:', props.id);
          aiEditContent.value = null;
          return;
        }
        aiEditContent.value = module;
        getModelList();
      }
    }
  );

  // 可选择语种
  const languageList = ref<any>([
    {
      label: '简体中文',
      value: '简体中文'
    },
    {
      label: '英语',
      value: '英语'
    },
    {
      label: '日语',
      value: '日语'
    },
    {
      label: '韩语',
      value: '韩语'
    }
  ]);

  // 取消
  const cancle = () => {
    cancleAiTranslateTextAsync();
    emit('cancle');
  };

  // 创作关键词
  const language = ref<string>('英语');

  // 点击开始润色
  const aiLoading = ref<boolean>(false);
  const aiEditContent = ref<any>('');
  const serialNumber = ref<string>('');
  const submit = async () => {
    if (!selectedModel.value) {
      ElMessage.warning('请先选择AI模型');
      return;
    }
    // 先获取流水号
    const serialNumberResult = await getSerialNumberAsync();
    if (serialNumberResult.data.status == 200) {
      serialNumber.value = serialNumberResult.data.data;
    } else {
      ElMessage.error('流水号生成失败');
      return;
    }
    if (aiLoading.value) return;
    if (!aiEditContent.value) {
      ElMessage.error('无法获取模块数据');
      return;
    }
    let message: any = {
      title: {}
    };
    message['dataSource'] = aiEditContent.value.dataSource; // 简历内容
    message['title'] = {
      value: aiEditContent.value.title
    };
    console.log('需要翻译的内容', JSON.stringify(message));
    const extractValue = extractValues(message); // 提取value
    console.log('提取出的value', JSON.stringify(extractValue));

    // 点击AI
    let params = {
      model: selectedModel.value,
      text: JSON.stringify(extractValue),
      languages: language.value,
      serialNumber: serialNumber.value
    };
    if (!params.languages) {
      ElMessage.warning('请先选择目标语种');
      return;
    }
    aiLoading.value = true;
    const data = await translateTextAsync(params);
    if (data.data.status === 200) {
      aiEditContent.value = data.data.data;
      try {
        const result = aiEditContent.value.replace(/```json/g, '');
        const resule2 = result.replace(/```/g, '');
        console.log('翻译结果', parseJSON(resule2));
        const restoreJsonValue = restoreValues(message, parseJSON(resule2)); // 将翻译结果还原为原数据
        console.log('还原的数据', restoreJsonValue);
        // 更新JSON
        const module = useGetSelectedModule(props.id);
        if (module) {
          module.title = restoreJsonValue['title'].value;
          module.dataSource = restoreJsonValue['dataSource'];
          ElMessage.success('语种切换成功~~');
        } else {
          ElMessage.error('无法更新模块，找不到目标模块');
        }
        cancle();
      } catch (error) {
        ElNotification({
          title: '翻译失败',
          message: '解析结果失败，内容过多，请尝试按模块翻译',
          type: 'error'
        });
        cancle();
      }
    } else {
      ElMessage.warning(data.data.message || 'AI使用人数太多，请重试~~');
      cancleAiTranslateTextAsync();
    }
    aiLoading.value = false;
    console.log(data);
  };
</script>
<style lang="scss">
  .ai-content-translate-select-warpper {
    .tips {
      font-size: 12px;
      color: #b3afaf;
      line-height: 1.5;
      margin-bottom: 15px;
    }
  }
</style>
