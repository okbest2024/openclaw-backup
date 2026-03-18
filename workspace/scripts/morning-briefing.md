# 🌅 晨间简报配置

**执行时间**: 每天早上 7:30

**推送内容**:
1. 📅 今日日程（飞书日历）
2. 🌤️ 天气情况
3. ✅ 待办事项（飞书任务）
4. 📬 重要提醒

---

## Cron 配置示例

```json
{
  "name": "morning-briefing",
  "schedule": "0 7:30 * * *",
  "command": "openclaw send --channel feishu --to ou_b317d2d01fed443d0a2e94a15f8a4ba1 \"晨间简报内容\""
}
```

---

## 手动执行检查清单

### 1. 检查今日日程
```bash
feishu_calendar_event list --start_time "2026-03-18T00:00:00+08:00" --end_time "2026-03-18T23:59:59+08:00"
```

### 2. 检查天气
```bash
weather
```

### 3. 检查待办任务
```bash
feishu_task_task list
```

### 4. 检查未读消息
```bash
feishu_im_user_get_messages --relative_time "today"
```

---

## 简报模板

```
🌅 早安！今天是 2026 年 3 月 18 日 星期三

📅 今日日程:
- 09:00 团队站会
- 14:00 产品评审会

🌤️ 天气:
- 上海：晴，15-22°C，空气质量优

✅ 今日待办:
- [ ] 完成项目文档
- [ ] 回复客户邮件

💡 提醒:
- 下午会议记得准备演示材料
```

---

*创建时间：2026-03-18*
