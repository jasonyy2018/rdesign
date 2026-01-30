const createDialog = (fn?: () => any) => {
  console.log('LoginDialog: Guest access enabled, blocking login prompt.');
  // 如果有回调函数，直接执行，模拟登录成功
  if (fn) {
    fn();
  }
};

export default createDialog;
