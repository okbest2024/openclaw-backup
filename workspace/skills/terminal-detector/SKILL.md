---
name: "terminal-detector"
description: "Detect and list all terminal windows on the system. Invoke when you need to find terminal windows for automation or debugging."
---

# Terminal Detector

Detect and list all terminal windows on the system using Win32 API.

## Purpose

Use this skill to find all terminal windows (PowerShell, CMD, Windows Terminal, etc.) for automation tasks.

## Usage

### Python Script

```bash
python "F:\ai-trace\定位trace对话框\test\.trae\skills\terminal-detector\detect_terminals_win32.py"
```

### Output Example

```
[1] 终端窗口:
    窗口标题: 管理员: Windows PowerShell
    窗口类名: ConsoleWindowClass
    窗口句柄: 1056860
    进程ID: 39292
    进程信息: "powershell.exe","39292","Console","1","82,152 K"

[2] 终端窗口:
    窗口标题: Windows PowerShell
    窗口类名: CASCADIA_HOSTING_WINDOW_CLASS
    窗口句柄: 991412
    进程ID: 23240
    进程信息: "WindowsTerminal.exe","23240","Console","1","165,204 K"

总计: 2 个终端窗口
```

## Terminal Types

| 类型 | 类名 | 描述 |
|------|------|------|
| Windows Terminal | `CASCADIA_HOSTING_WINDOW_CLASS` | 现代 Windows Terminal |
| PowerShell | `ConsoleWindowClass` | 传统 PowerShell 控制台 |
| CMD | `ConsoleWindowClass` | 命令提示符 |
| 管理员 PowerShell | `ConsoleWindowClass` | 以管理员身份运行的 PowerShell |

## Technical Notes

- Uses **Win32 API** (`EnumWindows`, `GetWindowText`, `GetClassName`) for reliable detection
- UI Automation may not detect some console windows (like "管理员: Windows PowerShell")
- Win32 API provides more comprehensive results

## Files

| 文件 | 用途 |
|------|------|
| `detect_terminals_win32.py` | 使用 Win32 API 检测终端 |
| `detect_terminals.py` | 使用 UI Automation 检测终端（备用） |

## Related Skills

- `openclaw-tui-sender`: 发送消息到 OpenClaw TUI
- `trae-trace-sender`: 发送到 Trae CN SOLO Coder
