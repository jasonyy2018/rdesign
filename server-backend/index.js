const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 模拟数据库 (简单起见，这里先用内存对象，实际开发建议接 MongoDB)
const db = {
  users: [],
  resumes: [],
  links: [{ id: '1', name: 'AI职升姬官网', link: '/' }],
  vxquns: [{ id: '1', name: '本地开发交流群', qr_code: 'https://via.placeholder.com/150' }]
};

// --- 接口复刻 ---

// 1. 公共接口
app.get('/huajian/common/getVXQunListUnauth', (req, res) => {
  res.json({ code: 200, data: db.vxquns });
});

app.get('/huajian/common/getLinksList', (req, res) => {
  res.json({ code: 200, data: { list: db.links } });
});

// 2. 用户系统 (简易版)
app.post('/huajian/user/login', (req, res) => {
  const { email } = req.body;
  // 这里简化处理，任何用户都能登录，返回一个 mock token
  res.json({
    code: 200,
    data: {
      token: 'mock-token-' + uuidv4(),
      userInfo: { email, nickname: '本地开发者', id: 'user-1' }
    }
  });
});

app.get('/huajian/user/getUserInfo', (req, res) => {
  res.json({
    code: 200,
    data: { email: 'dev@local.com', nickname: '本地开发者', role: 'admin' }
  });
});

// 3. 简历系统
app.get('/huajian/resume/getResumeList', (req, res) => {
  res.json({
    code: 200,
    data: { list: db.resumes, total: db.resumes.length }
  });
});

app.post('/huajian/resume/saveResume', (req, res) => {
  const resumeData = req.body;
  const newResume = {
    ...resumeData,
    id: uuidv4(),
    updateDate: new Date().toISOString()
  };
  db.resumes.push(newResume);
  res.json({ code: 200, message: '保存成功', data: newResume });
});

// 启动
app.listen(port, '0.0.0.0', () => {
  console.log(`
  ================================================
  🚀 AI职升姬 复刻后端 已在本地启动！
  ================================================
  API 地址: http://localhost:${port}
  
  已复刻接口:
  - 公共数据: /huajian/common/getVXQunListUnauth
  - 用户登录: /huajian/user/login
  - 简历保存: /huajian/resume/saveResume
  - 简历列表: /huajian/resume/getResumeList
  ================================================
  `);
});
