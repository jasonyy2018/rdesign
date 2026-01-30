<template>
  <el-dialog
    :model-value="dialogLinkVisible"
    width="500px"
    title="申请友链"
    :show-close="true"
    :close-on-click-modal="true"
    append-to-body
    @close="cancle"
  >
    <div class="apply-link-dialog-box">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
        size="default"
        status-icon
      >
        <el-form-item label="网站名称:" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网站描述:" prop="abstract">
          <el-input v-model="ruleForm.abstract" placeholder="请输入网站描述" />
        </el-form-item>
        <el-form-item label="网站Logo:" prop="logo">
          <el-input v-model="ruleForm.logo" placeholder="请输入网站Logo链接" />
        </el-form-item>
        <el-form-item label="友情链接:" prop="link">
          <el-input v-model="ruleForm.link" placeholder="请以'https://aizhishengji.example.com'格式填写链接" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancle">取消</el-button>
        <el-button type="primary" @click="submit(ruleFormRef)"> 提交申请 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
  import { FormInstance, FormRules } from 'element-plus';
  import { applyLinksAsync } from '@/http/api/website';

  const emit = defineEmits(['cancle', 'updateSuccess']);
  interface TDialog {
    dialogLinkVisible: boolean;
  }
  const props = withDefaults(defineProps<TDialog>(), {
    dialogLinkVisible: false
  });

  // 表单数据
  const ruleForm = reactive({
    name: '',
    abstract: '',
    logo: '',
    link: ''
  });
  const rules = reactive<FormRules>({
    name: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
    abstract: [{ required: true, message: '请输入网站描述', trigger: 'blur' }],
    logo: [{ required: true, message: '请输入Logo链接', trigger: 'blur' }],
    link: [{ required: true, message: '请输入网站链接', trigger: 'blur' }]
  });

  // 提交
  const ruleFormRef = ref<FormInstance>();
  const submit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        const data = await applyLinksAsync(ruleForm);
        if (data.status === 200) {
          ElMessage.success('提交成功，请等待审核！');
          emit('updateSuccess');
          cancle();
        } else {
          ElMessage.error(data.data.message);
        }
      } else {
        console.log('error submit!', fields);
      }
    });
  };

  // 取消
  const cancle = () => {
    emit('cancle');
  };
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
