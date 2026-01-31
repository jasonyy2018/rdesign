<!-- 审核弹窗 -->
<template>
  <el-dialog
    class="download-resume-select"
    :model-value="dialogDownloadVisible"
    title="下载简历"
    width="500px"
    append-to-body
    @close="handleClose"
  >
    <div class="content-box">
      <div class="content-down-btn">
        <!-- 下载为图片 -->
        <div class="download-img-box">
          <div class="download-com-box img-box" @click="downloadDialog('img')">
            <svg-icon icon-name="icon-tupian" color="#fff" size="26px"></svg-icon>
            <span>下载图片</span>
          </div>
          <p>适合微信、QQ发送</p>
        </div>
        <!-- 下载PDF -->
        <div class="download-pdf-box">
          <div class="download-com-box pdf-box" @click="downloadDialog('pdf')">
            <svg-icon icon-name="icon-pdf" color="#fff" size="26px"></svg-icon>
            <span>下载PDF</span>
          </div>
          <p>适合打印、在线投递等(<span>推荐</span>)</p>
        </div>
        <!-- 下载Markdown -->
        <div class="download-pdf-box download-md">
          <div class="download-com-box pdf-box" @click="downloadMD">
            <svg-icon icon-name="icon-markdown-line" color="#fff" size="26px"></svg-icon>
            <span>下载Markdown</span>
          </div>
          <p>适合本地修改、提取内容</p>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
  const emit = defineEmits(['closeDownloadDialog', 'downloadFile', 'downloadMarkdown']);
  interface TDialog {
    dialogDownloadVisible: boolean;
  }
  withDefaults(defineProps<TDialog>(), {
    dialogDownloadVisible: false
  });

  const downloadDialog = async (type: string) => {
    emit('downloadFile', type);
  };

  const handleClose = () => {
    emit('closeDownloadDialog');
  };

  const downloadMD = () => {
    emit('downloadMarkdown');
  };
</script>
<style lang="scss" scoped>
  .dialog-footer button:first-child {
    margin-right: 10px;
  }
  .download-resume-select {
    .content-box {
      padding: 20px 0;
      .content-down-btn {
        display: flex;
        justify-content: center;
        .download-img-box,
        .download-pdf-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          margin: 0 20px;
          width: 170px;
          .price {
            display: flex;
            align-items: center;
            margin: 7px 0 0 0;
            .how-much {
              display: flex;
              align-items: center;
              justify-content: space-between;
              img {
                margin-left: 2px;
                margin-bottom: 1px;
              }
            }
          }
          .download-com-box {
            width: 110px;
            height: 110px;
            border-radius: 5px;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #fff;
            span {
              margin-top: 10px;
            }
          }
          p {
            color: #888;
            font-size: 12px;
            margin-top: 10px;
          }
          .download-disabled {
            user-select: none;
            cursor: not-allowed;
            opacity: 0.6;
          }
          .img-box {
            background: linear-gradient(90deg, #a986ff 0, #9861ff 100%);
            &:hover {
              background: linear-gradient(90deg, #a986ff 0, #9861ff 50%);
            }
          }
          .pdf-box {
            background: linear-gradient(149deg, #ffa98f 0, #ff6464 100%);
            &:hover {
              background: linear-gradient(149deg, #ffa98f 0, #ff6464 50%);
            }
          }
        }
        .download-md {
          position: relative;
          .vip-icon {
            position: absolute;
            top: -16px;
            right: 24px;
          }
        }
      }

      .get-bi-method {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        height: 30px;
        width: 80px;
        background-color: #70f5c4;
        border-radius: 15px;
        font-size: 13px;
        transition: all 0.3s;
        margin: 0 auto;
        margin-top: 25px;
        cursor: pointer;
        letter-spacing: 1px;
        user-select: none;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
</style>
