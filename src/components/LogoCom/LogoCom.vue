<template>
  <div id="logo" class="logo" @click="toHome">
    <span class="logo-text">AI职升姬</span>
  </div>
</template>
<script lang="ts" setup>
  const router = useRouter();
  const toHome = () => {
    router.push('/');
  };
</script>
<style lang="scss" scoped>
  .logo {
    height: 80%;
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    img {
      height: 100%;
    }
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #2faf5a;
      letter-spacing: 1px;
    }
  }
</style>
