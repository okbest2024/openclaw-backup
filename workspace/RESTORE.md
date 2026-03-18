# OpenClaw 工作区恢复指南

> 当需要完全恢复工作区时，按以下步骤操作。

---

## 🚀 快速恢复（一键脚本）

### Windows PowerShell

```powershell
# 1. 进入工作区
cd C:\Users\Administrator\.openclaw\workspace

# 2. 确保 git 仓库已初始化
if (!(Test-Path .git)) {
    git init
    git remote add origin https://github.com/okbest2024/tgmqqclawyang.git
}

# 3. 获取所有分支
git fetch origin

# 4. 从 main 分支恢复技能
git checkout origin/main -- skills/ avatars/

# 5. 从 master 分支恢复记忆
git checkout origin/master -- MEMORY.md memory/

# 6. 从 main 分支恢复配置文件
git checkout origin/main -- SOUL.md USER.md AGENTS.md IDENTITY.md TOOLS.md HEARTBEAT.md

# 7. 清理可能的嵌套目录
if (Test-Path skills\skills) {
    Move-Item skills\skills\* skills\ -Force
    Remove-Item skills\skills -Recurse -Force
}

Write-Host "✅ 工作区恢复完成！" -ForegroundColor Green
```

### Linux/macOS Bash

```bash
#!/bin/bash

WORKSPACE="$HOME/.openclaw/workspace"
cd "$WORKSPACE"

# 1. 确保 git 仓库已初始化
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/okbest2024/tgmqqclawyang.git
fi

# 2. 获取所有分支
git fetch origin

# 3. 从 main 分支恢复技能和配置
git checkout origin/main -- skills/ avatars/ SOUL.md USER.md AGENTS.md IDENTITY.md TOOLS.md HEARTBEAT.md

# 4. 从 master 分支恢复记忆
git checkout origin/master -- MEMORY.md memory/

# 5. 清理可能的嵌套目录
if [ -d "skills/skills" ]; then
    mv skills/skills/* skills/
    rm -rf skills/skills
fi

echo "✅ 工作区恢复完成！"
```

---

## 📁 必需文件清单

### 核心配置（main 分支）
- `SOUL.md` - AI 身份和人格
- `USER.md` - 用户信息
- `AGENTS.md` - 工作区规则
- `IDENTITY.md` - AI 元数据（名字、头像等）
- `TOOLS.md` - 本地工具配置
- `HEARTBEAT.md` - 心跳任务配置

### 技能库（main 分支）
- `skills/` - 所有技能目录（121 个技能）
- `avatars/` - 头像图片

### 记忆系统（master 分支）
- `MEMORY.md` - 长期记忆
- `memory/` - 日常日记目录

---

## 🔧 故障排查

### 问题 1：技能目录嵌套
**症状**：`skills/skills/` 存在
**解决**：
```powershell
Move-Item skills\skills\* skills\ -Force
Remove-Item skills\skills -Recurse -Force
```

### 问题 2：MEMORY.md 不存在
**原因**：在 master 分支，不在 main 分支
**解决**：
```powershell
git checkout origin/master -- MEMORY.md memory/
```

### 问题 3：git 仓库未初始化
**解决**：
```powershell
git init
git remote add origin https://github.com/okbest2024/tgmqqclawyang.git
git fetch origin
```

---

## 📝 恢复后验证

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

---

## 🔄 日常维护建议

1. **定期备份**：重要记忆更新后 commit 到 git
2. **统一分支**：考虑将所有文件合并到单一分支（main）
3. **版本标签**：重要版本打 tag 便于回滚

---

*最后更新：2026-03-16*
*创建者：盖世 baby*
