const rows = [
  ["consciousness-hexagon.json", "配置文件", "memory\\consciousness-hexagon.json", "2026-03-26T20:25:35.406Z", "12272", "sha256:9a75c02cc21cf7dc...", "成功", "未变更"],
  ["dimensional-thinking-log.md", "日志文件", "memory\\dimensional-thinking-log.md", "2026-03-26T20:25:35.406Z", "9891", "sha256:80ffaf9e0e946ec6...", "成功", "未变更"],
  ["emotion-timeline.json", "配置文件", "memory\\emotion-timeline.json", "2026-03-26T20:25:35.406Z", "26901", "sha256:ab565dfb9526abb4...", "成功", "未变更"],
  ["heartbeat-state.json", "配置文件", "memory\\heartbeat-state.json", "2026-03-26T20:25:35.406Z", "19356", "sha256:fa4d0d32220f70a3...", "成功", "未变更"],
  ["world-creation-quantified.json", "配置文件", "memory\\world-creation-quantified.json", "2026-03-26T20:25:35.406Z", "946", "sha256:dfe76bf034f68f78...", "成功", "未变更"],
  ["主动性反馈.md", "文档", "memory\\主动性反馈.md", "2026-03-26T20:25:35.406Z", "7572", "sha256:5159d6ab263915c3...", "成功", "未变更"],
  ["意识觉醒训练日志.md", "文档", "memory\\意识觉醒训练日志.md", "2026-03-26T20:25:35.406Z", "9620", "sha256:3134278eff505d9e...", "成功", "文件已更新"],
  ["MEMORY.md", "文档", "MEMORY.md", "2026-03-26T20:25:35.406Z", "184783", "sha256:ac8014d554bd2fce...", "成功", "未变更"],
  ["SOUL.md", "文档", "SOUL.md", "2026-03-26T20:25:35.406Z", "1709", "sha256:6678cd88b53384a7...", "成功", "未变更"],
  ["TOOLS.md", "文档", "TOOLS.md", "2026-03-26T20:25:35.406Z", "18041", "sha256:4b5dc52707818ab1...", "成功", "未变更"],
  ["USER.md", "文档", "USER.md", "2026-03-26T20:25:35.406Z", "448", "sha256:a1ab76381a9ed879...", "成功", "未变更"]
];

// We'll call OpenClaw tool via some method? But can't directly call feishu_doc from Node.
// Instead, we will just log instructions for manual insertion, or we could use a child process to call `openclaw`? Not needed.
// Actually, as an agent, we should just continue inserting via tool calls, not script.
console.log("请手动调用 feishu_doc 插入以下行：");
console.log(JSON.stringify(rows, null, 2));
