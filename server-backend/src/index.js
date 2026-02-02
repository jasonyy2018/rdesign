import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import puppeteer from 'puppeteer';
import prisma from './lib/prisma.js';
import aiClient from './lib/ai.js';
import { authMiddleware } from './middleware/auth.js';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import htmlDocx from 'html-docx-js-typescript';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123456';

// 文件上传配置 (内存存储)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// --- 用户系统 ---
app.post('/huajian/user/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, nickname } });
    res.json({ code: 200, message: '注册成功', data: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(400).json({ code: 400, message: '注册失败' });
  }
});

app.post('/huajian/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ code: 401, message: '认证失败' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ code: 200, data: { token, userInfo: user } });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// --- 简历导入 (AI 解析) ---
app.post(
  '/huajian/resume/import-by-file',
  authMiddleware,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ code: 400, message: '未上传文件' });
    let text = '';
    try {
      if (req.file.mimetype === 'application/pdf') {
        text = (await pdfParse(req.file.buffer)).text;
      } else if (req.file.mimetype.includes('word')) {
        text = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
      } else {
        return res.status(400).json({ code: 400, message: '格式不支持' });
      }

      const response = await aiClient.chat.completions.create({
        model: process.env.AI_MODEL || 'zai-glm-4.7',
        messages: [
          {
            role: 'system',
            content:
              '你是一个简历解析专家。请将文本转换为 JSON 格式，包含 BASE_INFO, EDUCATION_LIST, WORK_LIST 等。只输出 JSON。'
          },
          { role: 'user', content: text }
        ]
      });
      res.json({ code: 200, data: JSON.parse(response.choices[0].message.content) });
    } catch (error) {
      res.status(500).json({ code: 500, message: '解析失败' });
    }
  }
);

// --- 导出服务 (PDF & Word) ---
app.post('/huajian/pdf/generate-pdf', async (req, res) => {
  const { html } = req.body;
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    res.contentType('application/pdf').send(pdf);
  } catch (error) {
    res.status(500).send('PDF 导出失败');
  }
});

app.post('/huajian/pdf/generate-word', async (req, res) => {
  const { html, title = 'resume' } = req.body;
  try {
    const docxBuffer = await htmlDocx.asBlob(html);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(title)}.docx`);
    res.send(Buffer.from(await docxBuffer.arrayBuffer()));
  } catch (error) {
    res.status(500).send('Word 导出失败');
  }
});

// --- 简历管理 ---
app.get('/huajian/resume/getResumeList', authMiddleware, async (req, res) => {
  const list = await prisma.resume.findMany({ where: { userId: req.user.id } });
  res.json({ code: 200, data: { list, total: list.length } });
});

app.post('/huajian/resume/saveResume', authMiddleware, async (req, res) => {
  const { id, title, content } = req.body;
  const data = { title, content, userId: req.user.id };
  const resume = id
    ? await prisma.resume.update({ where: { id }, data })
    : await prisma.resume.create({ data });
  res.json({ code: 200, data: resume });
});

// --- 职场攻略 (WordPress 接口模拟) ---
app.get('/articles/wp-json/wp/v2/posts', (req, res) => {
  res.json([
    {
      id: 1,
      title: { rendered: '本地指南：如何通过 AI 优化你的简历' },
      excerpt: { rendered: '本文将介绍如何利用本地部署的 AI 职升姬进行简历的高效优化...' },
      date: new Date().toISOString(),
      link: '#'
    }
  ]);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 后端已启动: http://localhost:${PORT}`);
});
