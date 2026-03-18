const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 创建上传和音频目录
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const AUDIO_DIR = path.join(__dirname, 'audio');
const PROGRESS_FILE = path.join(__dirname, 'progress.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR);

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AUDIO_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB 限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|flac|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('不支持的音频格式'));
    }
  }
});

// 加载播放进度
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('加载进度失败:', e);
  }
  return {};
}

// 保存播放进度
function saveProgress(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (e) {
    console.error('保存进度失败:', e);
  }
}

// API: 获取所有音频文件
app.get('/api/tracks', (req, res) => {
  const progress = loadProgress();
  
  fs.readdir(AUDIO_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: '读取文件失败' });
    }
    
    const tracks = files
      .filter(file => /\.(mp3|wav|ogg|flac|m4a)$/i.test(file))
      .map(file => {
        const filePath = path.join(AUDIO_DIR, file);
        const stats = fs.statSync(filePath);
        const originalName = file.replace(/^\d+-\d+-/, '').replace(/\.[^.]+$/, '');
        
        return {
          id: file,
          name: originalName,
          filename: file,
          url: `/audio/${file}`,
          size: stats.size,
          duration: progress[file]?.duration || 0,
          currentTime: progress[file]?.currentTime || 0,
          uploadedAt: stats.birthtime
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
    
    res.json(tracks);
  });
});

// API: 上传音频文件
app.post('/api/upload', upload.array('audio', 100), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '请选择文件' });
  }
  
  const uploaded = req.files.map(file => ({
    id: file.filename,
    name: file.originalname.replace(/\.[^.]+$/, ''),
    filename: file.filename,
    url: `/audio/${file.filename}`,
    size: file.size
  }));
  
  res.json({ success: true, files: uploaded });
});

// API: 删除音频文件
app.delete('/api/tracks/:id', (req, res) => {
  const filePath = path.join(AUDIO_DIR, req.params.id);
  const progress = loadProgress();
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除失败' });
    }
    
    // 同时删除进度记录
    delete progress[req.params.id];
    saveProgress(progress);
    
    res.json({ success: true });
  });
});

// API: 保存播放进度
app.post('/api/progress', (req, res) => {
  const { trackId, currentTime, duration } = req.body;
  const progress = loadProgress();
  
  progress[trackId] = {
    currentTime,
    duration,
    lastPlayed: new Date().toISOString()
  };
  
  saveProgress(progress);
  res.json({ success: true });
});

// 提供音频文件
app.use('/audio', express.static(AUDIO_DIR));

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 音频播放器服务器运行中:`);
  console.log(`   本地访问：http://localhost:${PORT}`);
  console.log(`   局域网访问：http://<你的 IP>:${PORT}`);
  console.log(`   上传目录：${AUDIO_DIR}`);
  console.log(`   进度文件：${PROGRESS_FILE}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用，请关闭其他程序或更换端口`);
  } else {
    console.error('服务器错误:', err);
  }
  process.exit(1);
});
