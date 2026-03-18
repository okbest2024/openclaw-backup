# OpenClaw 迁移检查清单

## 部署前准备

- [ ] 确认目标电脑已安装 Node.js (v18+)
- [ ] 确认目标电脑已安装 Git
- [ ] 准备好 GitHub 仓库地址
- [ ] 准备好 AI 提供商 API 密钥
- [ ] 确认网络连接正常（特别是访问 GitHub）

## 部署步骤

- [ ] 安装 OpenClaw: `npm install -g openclaw`
- [ ] 登录 OpenClaw: `openclaw login`
- [ ] 创建工作区目录
- [ ] 克隆 GitHub 仓库
- [ ] 启动 Gateway: `openclaw gateway start`
- [ ] 验证 Gateway 状态：`openclaw gateway status`

## 配置检查

- [ ] 检查 `IDENTITY.md` 是否正确
- [ ] 检查 `USER.md` 时区是否正确
- [ ] 更新 `TOOLS.md`（如有环境特定配置）
- [ ] 检查 API 密钥配置

## 定时任务设置

- [ ] 设置自动备份任务
  - Windows: 运行 `scripts/setup-cron.ps1`
  - macOS/Linux: 运行 `scripts/setup-cron.sh`
- [ ] 验证定时任务已创建
  - Windows: 打开"任务计划程序"查看
  - macOS: `launchctl list | grep openclaw`
  - Linux: `crontab -l`

## 功能测试

- [ ] 发送"你好"测试对话
- [ ] 验证 AI 助手人格正确（名字、语气等）
- [ ] 测试文件读写功能
- [ ] 测试网络搜索功能（如有）
- [ ] 测试定时任务（可选：手动触发一次）

## 网络优化（中国大陆用户）

- [ ] 修改 DNS 为 `1.1.1.1` 或 `223.5.5.5`
- [ ] 配置 npm 淘宝镜像：`npm config set registry https://registry.npmmirror.com`
- [ ] 测试 GitHub 访问速度
- [ ] 如有需要，配置代理

## 数据同步

- [ ] 从 GitHub 拉取最新代码：`git pull`
- [ ] 检查是否有本地未提交变更
- [ ] 如有变更，提交并推送：`git add -A && git commit -m "xxx" && git push`

## 故障排除

### 常见问题

- **Gateway 启动失败**: 检查日志 `openclaw logs`
- **API 密钥错误**: 重新登录 `openclaw login`
- **Git 克隆失败**: 检查网络或使用镜像站
- **npm 安装失败**: 使用淘宝镜像

### 日志位置

- Gateway 日志：`openclaw logs --follow`
- 备份日志：`~/.openclaw/logs/backup.log`
- 系统日志：事件查看器（Windows）或 `journalctl`（Linux）

## 完成确认

- [ ] 所有检查项通过
- [ ] AI 助手正常工作
- [ ] 定时备份已设置
- [ ] 数据已同步到 GitHub

---

_✨ 由盖世 baby 创建 · 宇宙之主认证_
