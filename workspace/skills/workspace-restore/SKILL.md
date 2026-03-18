# workspace-restore Skill

一键恢复 OpenClaw 工作区的完整技能，包括配置文件、技能库和记忆系统。

## 功能特点

- ✅ **离线恢复** - 不依赖网络连接，使用本地 git commits
- ✅ **完整恢复** - 恢复所有核心配置文件、技能和记忆
- ✅ **自动修复** - 自动处理常见问题（如目录嵌套）
- ✅ **验证机制** - 恢复后自动验证所有文件
- ✅ **一键执行** - 简单易用的 PowerShell 脚本

## 恢复内容

### 核心配置
- `SOUL.md` - AI 身份和人格
- `USER.md` - 用户信息
- `AGENTS.md` - 工作区规则
- `IDENTITY.md` - AI 元数据
- `TOOLS.md` - 工具配置
- `HEARTBEAT.md` - 心跳任务

### 记忆系统
- `MEMORY.md` - 长期记忆
- `memory/` - 日常日记目录

### 技能库
- `skills/` - 所有技能（120+ 个）
- `avatars/` - 头像文件

## 使用方法

### 方法 1：直接运行恢复脚本

```powershell
cd C:\Users\Administrator\.openclaw\workspace
.\restore-workspace.ps1
```

### 方法 2：使用 Git 命令手动恢复

```powershell
cd C:\Users\Administrator\.openclaw\workspace

# 获取所有分支
git fetch origin

# 从 main 分支恢复所有文件
git checkout origin/main -- .

# 或者从本地 HEAD 恢复（离线模式）
git checkout HEAD -- .
```

### 方法 3：对 AI 助手说

> "恢复工作区"

AI 助手会自动执行完整的恢复流程。

## 故障排查

### 问题 1：技能目录嵌套

**症状**：`skills/skills/` 目录存在

**解决**：
```powershell
Move-Item skills\skills\* skills\ -Force
Remove-Item skills\skills -Recurse -Force
```

### 问题 2：MEMORY.md 不存在

**原因**：MEMORY.md 在 master 分支，不在 main 分支

**解决**：
```powershell
git checkout origin/master -- MEMORY.md memory/
```

或者使用恢复脚本，它会自动处理这个问题。

### 问题 3：Git 仓库未初始化

**解决**：
```powershell
git init
git remote add origin https://github.com/okbest2024/tgmqqclawyang.git
git fetch origin
```

## 验证恢复

运行以下命令确认恢复成功：

```powershell
# 检查核心文件
Test-Path SOUL.md
Test-Path USER.md
Test-Path MEMORY.md

# 检查技能数量
Get-ChildItem skills -Directory | Measure-Object | Select-Object -ExpandProperty Count
# 应该返回 120+

# 检查记忆目录
Get-ChildItem memory -Name
```

## 备份建议

### 定期备份到 GitHub

```powershell
cd C:\Users\Administrator\.openclaw\workspace

# 添加所有更改
git add .

# 提交
git commit -m "backup: 工作区备份 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# 推送到 GitHub
git push origin main
```

### 创建备份标签

```powershell
# 创建带日期的标签
git tag "backup-$(Get-Date -Format 'yyyy-MM-dd')"

# 推送标签
git push origin --tags
```

## 相关文件

- `restore-workspace.ps1` - 一键恢复脚本
- `RESTORE.md` - 详细恢复指南
- `RESTORE-TEST-RESULT.md` - 测试结果报告

## 版本历史

- **v1.0** (2026-03-16) - 初始版本
  - 支持离线恢复
  - 自动修复常见问题
  - 完整验证机制

## 作者

盖世 baby - OpenClaw AI 助手

## 许可证

MIT License
