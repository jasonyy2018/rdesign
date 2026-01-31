<template>
  <div class="right-card-box">
    <!-- 标签 -->
    <div class="tags-box">
      <com-title title="标签"></com-title>
      <div class="tags-list-box">
        <span v-for="(item, index) in content.pan_source_tags" :key="index" class="tag">{{
          item
        }}</span>
      </div>
    </div>

    <!-- 下载 -->
    <div class="download-box">
      <com-title title="立即获取"></com-title>
      <div class="button-list-box">
        <div
          v-for="(item, index) in content.pan_source_download"
          :key="index"
          class="button"
          @click="toDownload(item.name)"
        >
          {{ item.name }}
          <span v-if="item.pass">{{ `(提取码:${item.pass})` }}</span>
        </div>
      </div>
    </div>
    <!-- 添加微信群 -->
    <div class="download-box">
      <com-title title="微信交流群"></com-title>
      <div v-viewer class="vx-box">
        <template v-if="vxQunList.length">
          <img
            v-for="(item, index) in vxQunList"
            :key="index"
            :src="item.qr_code"
            :alt="item.name"
            srcset=""
          />
        </template>
      </div>
    </div>
    <!-- 添加微信 -->
    <div class="download-box">
      <com-title title="添加微信入群"></com-title>
      <div v-viewer class="vx-box">
        <p>备注【加群】</p>
        <img src="@/assets/images/vx.jpg" alt="微信" />
      </div>
    </div>

    <!-- QQ群 -->
    <div class="download-box">
      <com-title title="QQ交流群"></com-title>
      <div class="qq-box">
        <p>①群：976432879（已满）</p>
        <p>②群：947841579</p>
        <p>③群：961251875</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import LoginDialog from '@/components/LoginDialog/LoginDialog';
  import ComTitle from './ComTitle.vue';
  import 'element-plus/es/components/message-box/style/index';
  import { getVXQunListUnauthAsync } from '@/http/api/website';
  import { panShareDownloadUrlAsync } from '@/http/api/panShare';
  defineProps<{
    content: any;
  }>();

  const { id } = useRoute().query;

  // 查询微信微信群列表
  const vxQunList = ref<any>([]);
  const getVXQunListUnauth = async () => {
    vxQunList.value = [];
    const data = await getVXQunListUnauthAsync();
    if (data.status === 200) {
      data.data.map((item: { name: string }) => {
        if (item.name === '软件分享微信群聊') {
          vxQunList.value.push(item);
        }
      });
    } else {
      ElMessage.error(data.data.message);
    }
  };
  getVXQunListUnauth();

  // 点击下载
  const toDownload = async (name: string) => {
    const token = localStorage.getItem('token'); // 判断是否登录
    if (!token) {
      LoginDialog(() => {
        downloadTemplate(name);
      });
    } else {
      downloadTemplate(name);
    }
  };

  // 下载文件
  const downloadTemplate = async (name: string) => {
    const data = await panShareDownloadUrlAsync(id);
    if (data.data.status === 200) {
      ElMessage.success('即将开始下载');
      data.data.data.pan_source_download.forEach(
        (item: { name: string; link: string | URL | undefined }) => {
          if (item.name === name) {
            window.open(item.link, '_blank');
          }
        }
      );
    } else {
      ElMessage.error(data.data.message);
    }
  };
</script>
<style lang="scss" scoped>
  .right-card-box {
    width: 350px;
    min-height: 400px;
    .tags-box {
      background-color: #fff;
      border-radius: 10px;
      padding: 0 20px 20px 20px;
      margin-bottom: 30px;
      .tags-list-box {
        height: 60px;
        align-items: center;
        display: flex;
        .tag {
          padding: 5px 10px;
          background-color: #00c090;
          text-align: center;
          color: #fff;
          font-size: 14px;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
          letter-spacing: 2px;
        }
      }
    }
    .download-box {
      background-color: #fff;
      border-radius: 10px;
      padding: 0 20px 20px 20px;
      margin-bottom: 30px;
      .button-list-box {
        display: flex;
        flex-direction: column;
        padding: 20px 0 0 0;
        .button {
          width: 100%;
          height: 38px;
          margin-right: 20px;
          margin-bottom: 20px;
          line-height: 38px;
          text-align: center;
          letter-spacing: 2px;
          color: #fff;
          font-size: 14px;
          background-image: -webkit-linear-gradient(to right, #2ddd9d, #1cc7cf);
          background-image: -moz-linear-gradient(to right, #2ddd9d, #1cc7cf);
          background-image: -ms-linear-gradient(to right, #2ddd9d, #1cc7cf);
          background-image: linear-gradient(to right, #2ddd9d, #1cc7cf);
          -webkit-border-radius: 50px;
          -moz-border-radius: 50px;
          border-radius: 50px;
          background-color: #2ddd9d;
          -webkit-transition: all 0.3s;
          -moz-transition: all 0.3s;
          -ms-transition: all 0.3s;
          -o-transition: all 0.3s;
          transition: all 0.3s;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          &:hover {
            opacity: 0.8;
          }
          .how-much {
            display: flex;
            align-items: center;
            margin-right: 5px;
            img {
              margin: 0 5px;
            }
          }
        }
      }

      .vx-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        p {
          font-size: 16px;
          margin: 15px;
          letter-spacing: 2px;
          font-weight: 600;
        }
        img {
          max-width: 80%;
          height: 100%;
          cursor: pointer;
        }
      }

      .qq-box {
        padding: 10px 0;
        p {
          margin: 10px 0;
          font-size: 14px;
          color: #333;
          letter-spacing: 1px;
        }
      }
    }
  }
</style>
