<template>
  <nav class="nav-box">
    <div class="nav-left">
      <logo-com icon-color="#74a274" font-color="#74a274"></logo-com>
    </div>
    <div class="nav-center">
      <!-- 左侧菜单 -->
      <div class="left">
        <div class="nav-center-left-box">
          <el-tooltip effect="dark" content="新增任意简历模块" placement="bottom">
            <div class="icon-box" @click="openAddDrawer">
              <svg-icon icon-name="icon-database" color="#555" size="17px"></svg-icon>
              <span class="icon-tips">添加模块</span>
            </div>
          </el-tooltip>
          <el-tooltip effect="dark" content="切换另一个模板" placement="bottom">
            <div class="icon-box" @click="switchDrawer">
              <svg-icon icon-name="icon-shangchengmoban" color="#555" size="17px"></svg-icon>
              <span class="icon-tips">切换模板</span>
            </div>
          </el-tooltip>
          <el-tooltip effect="dark" content="查看JSSON" placement="bottom">
            <div class="icon-box" @click="viewJSON">
              <svg-icon icon-name="icon-json1" color="#555" size="17px"></svg-icon>
              <span class="icon-tips">查看JSON</span>
            </div>
          </el-tooltip>
        </div>
      </div>
      <div class="center">
        <p v-show="!isShowIpt">
          {{ resumeJsonNewStore.TITLE }}
          <el-icon :size="20" color="#409eff" @click="changeTitle">
            <Edit />
          </el-icon>
        </p>
        <el-input
          v-show="isShowIpt"
          ref="titleIpf"
          v-model="resumeJsonNewStore.TITLE"
          autofocus
          placeholder="请输入标题"
          @blur="blurTitle"
        />
      </div>
      <div class="right"></div>
    </div>
    <div class="nav-right">
      <el-tooltip effect="dark" content="下载到本地" placement="bottom">
        <div class="icon-box icon-download" @click="downloadResume">
          <svg-icon icon-name="icon-xiazai" color="#fff" size="17px"></svg-icon>
          <span class="icon-tips">导出</span>
        </div>
      </el-tooltip>
      <el-tooltip effect="dark" content="预览简历" placement="bottom">
        <div class="icon-box" @click="previewResume">
          <svg-icon icon-name="icon-yulan1" color="#555" size="19px"></svg-icon>
          <span class="icon-tips">预览</span>
        </div>
      </el-tooltip>
      <el-tooltip effect="dark" content="重置所有设置" placement="bottom">
        <div class="icon-box" @click="reset">
          <svg-icon icon-name="icon-zhongzhi" color="#555" size="17px"></svg-icon>
          <span class="icon-tips">重置</span>
        </div>
      </el-tooltip>
      <el-tooltip effect="dark" content="导出为JSON数据" placement="bottom">
        <div class="icon-box" @click="exportJSON">
          <svg-icon icon-name="icon-xiazai" color="#555" size="17px"></svg-icon>
          <span class="icon-tips">JSON</span>
        </div>
      </el-tooltip>
      <el-tooltip effect="dark" content="快来一起参与评论吧！" placement="bottom">
        <div class="icon-box" @click="publishComment">
          <svg-icon icon-name="icon-pinglun" color="#555" size="18px"></svg-icon>
          <span class="icon-tips">评论</span>
        </div>
      </el-tooltip>

      <el-tooltip
        v-if="name === 'custom'"
        class="box-item"
        effect="dark"
        content="导入JSON数据"
        placement="bottom"
      >
        <div class="icon-box" @click="importJson">
          <svg-icon icon-name="icon-yunduanshangchuan" color="#fff" size="19px"></svg-icon>
        </div>
      </el-tooltip>
    </div>
  </nav>

  <!-- 上传json代码编辑器 -->
  <import-json-dialog
    :dialog-visible="dialogVisible"
    @cancle="cancleJsonDialog"
  ></import-json-dialog>

  <!-- 增加自定义模块抽屉 -->
  <add-custom-model-drawer :drawer-visible="drawerVisible" @close-add-drawer="closeAddDrawer">
  </add-custom-model-drawer>

  <!-- 切换模板抽屉 -->
  <switch-template-drawer
    :drawer-switch-visible="drawerSwitchVisible"
    @close-switch-drawer="closeSwitchDrawer"
  ></switch-template-drawer>

  <!-- JSON查看抽屉 -->
  <view-json-drawer
    :drawer="drawerViewJsonVisible"
    @close-json-drawer="closeJsonDrawer"
  ></view-json-drawer>

  <!-- 下载弹窗 -->
  <download-dialog
    :dialog-download-visible="dialogDownloadVisible"
    @close-download-dialog="closeDownloadDialog"
    @download-file="downloadResumeFile"
  ></download-dialog>

  <!-- 预览窗口 -->
  <PreviewImage v-show="dialogPreviewVisible" @close="closePreview">
    <resume-preview></resume-preview>
  </PreviewImage>
</template>
<script lang="ts" setup>
  import appStore from '@/store';
  import { ElMessageBox } from 'element-plus';
  import 'element-plus/es/components/message-box/style/index';
  import FileSaver from 'file-saver';
  import { storeToRefs } from 'pinia';
  import ImportJsonDialog from '@/components/ImportJsonDialog/ImportJsonDialog.vue';
  import { cloneDeep } from 'lodash';
  import { getUuid } from '@/utils/common';
  import AddCustomModelDrawer from './AddCustomModelDrawer.vue';
  import SwitchTemplateDrawer from './SwitchTemplateDrawer.vue';
  import DownloadDialog from './DownloadDialog.vue';
  import ViewJsonDrawer from './ViewJsonDrawer.vue';

  let { resumeJsonNewStore } = storeToRefs(appStore.useResumeJsonNewStore); // store里的模板数据
  const emit = defineEmits(['generateReport', 'generateReportNew', 'reset', 'publishComment']);
  const route = useRoute();
  const { name } = route.query; // 模板id和模板名称
  // 跳转到首页

  // 更改标题
  const titleIpf = ref<any>(null);
  const isShowIpt = ref<boolean>(false);
  const changeTitle = () => {
    isShowIpt.value = true;
    titleIpf.value.focus();
  };
  const blurTitle = () => {
    isShowIpt.value = false;
  };

  onMounted(async () => {});

  // 预览简历
  const dialogPreviewVisible = ref<boolean>(false);
  const previewResume = () => {
    dialogPreviewVisible.value = true;
  };

  // 关闭预览弹窗
  const closePreview = () => {
    dialogPreviewVisible.value = false;
  };

  // 导出JSON
  const exportJSON = () => {
    let JSONData = cloneDeep(resumeJsonNewStore.value);
    JSONData.ID = getUuid();
    const data = JSON.stringify(JSONData, null, 4);
    const blob = new Blob([data], { type: '' });
    FileSaver.saveAs(blob, resumeJsonNewStore.value.TITLE + '.json');
  };

  // 打开导出弹窗
  const dialogDownloadVisible = ref<boolean>(false);
  const downloadResume = () => {
    dialogDownloadVisible.value = true;
  };

  // 关闭弹窗
  const closeDownloadDialog = () => {
    dialogDownloadVisible.value = false;
  };

  // 点击下载
  const downloadResumeFile = async (type: string) => {
    emit('generateReport', type);
    closeDownloadDialog();
  };

  // 重置
  const reset = () => {
    ElMessageBox.confirm('此操作会重置简历至初始状态，是否继续?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        emit('reset');
      })
      .catch(() => {});
  };

  // 上传JSON弹窗
  const dialogVisible = ref<boolean>(false);
  const importJson = () => {
    dialogVisible.value = true;
  };

  // 取消上传JSON
  const cancleJsonDialog = () => {
    dialogVisible.value = false;
  };

  // 发表评论
  const publishComment = () => {
    emit('publishComment');
  };

  // 打开添加自定义模块抽屉
  const drawerVisible = ref<boolean>(false);
  const openAddDrawer = () => {
    drawerVisible.value = true;
    console.log('打开抽屉', drawerVisible.value);
  };

  // 关闭抽屉
  const closeAddDrawer = () => {
    drawerVisible.value = false;
    console.log('关闭抽屉', drawerVisible.value);
  };

  // 打开切换模板抽屉
  const drawerSwitchVisible = ref<boolean>(false);
  const switchDrawer = () => {
    drawerSwitchVisible.value = true;
  };

  // 关闭切换模板抽屉
  const closeSwitchDrawer = () => {
    drawerSwitchVisible.value = false;
  };

  // 打开JSON查看抽屉
  const drawerViewJsonVisible = ref<boolean>(false);
  const viewJSON = () => {
    drawerViewJsonVisible.value = true;
  };

  // 关闭查看JSON查看抽屉
  const closeJsonDrawer = () => {
    drawerViewJsonVisible.value = false;
  };

  defineExpose({});
</script>
<style lang="scss" scopeds>
  .nav-box {
    height: 60px;
    width: 100%;
    background-color: #fff;
    position: sticky;
    top: 0;
    display: flex;
    box-shadow: 0 5px 21px 0 rgb(78 78 78 / 5%);
    z-index: 20;
    .nav-left {
      width: 300px;
      display: flex;
      align-items: center;
      user-select: none;
      padding: 0 0 0 40px;
    }
    .nav-center {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      height: 100%;
      .left {
        display: flex;
        height: 100%;
        .nav-center-left-box {
          height: 100%;
          display: flex;
          .icon-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #555;
            cursor: pointer;
            padding: 0 15px;
            height: 100%;
            transition: all 0.3s;
            &:hover {
              background-color: rgba($color: #74a274, $alpha: 0.1);
              color: #74a274;
            }
            .icon-tips {
              font-size: 12px;
              margin-top: 8px;
            }
          }
        }
        .draft-tips-box {
          height: 100%;
          display: flex;
          align-items: center;
          margin-left: 10px;
          .draft-tips {
            font-size: 10px;
            color: #999999;
          }
        }
      }
      .center {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        p {
          display: flex;
          align-items: center;
          font-size: 16px;
          .el-icon {
            margin-left: 10px;
            cursor: pointer;
          }
        }
        .el-input {
          width: 200px;
        }
      }
    }
    .nav-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 50px;
      .icon-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #555;
        cursor: pointer;
        padding: 0 15px;
        height: 100%;
        transition: all 0.3s;
        &:hover {
          background-color: rgba($color: #74a274, $alpha: 0.1);
          color: #74a274;
        }
        .icon-tips {
          font-size: 12px;
          margin-top: 8px;
        }
      }
      .icon-download {
        background-color: rgba($color: #74a274, $alpha: 1);
        color: #fff;
        &:hover {
          background-color: rgba($color: #74a274, $alpha: 0.9);
          color: #fff;
        }
      }
    }
  }
</style>
