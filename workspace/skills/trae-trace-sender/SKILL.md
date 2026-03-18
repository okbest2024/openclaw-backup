---
name: "trae-trace-sender"
description: "Sends messages to Trae CN's SOLO Coder trace dialog using UI Automation. Invoke when user wants to send messages to trace dialog or SOLO Coder."
---

# Trae Trace Dialog Message Sender

This skill sends messages to the SOLO Coder chat dialog in Trae CN IDE using Python uiautomation library.

## Prerequisites

- Trae CN IDE must be running
- Python with uiautomation library installed: `pip install uiautomation`
- The trace dialog should show "您正在与 SOLO Coder 聊天"

## Usage

### Direct Command

```bash
python "f:\ai-trace\定位trace对话框\traceqq\send_to_trace_dialog.py" "Your message here"
```

### Python Code

```python
import subprocess
import sys

message = "Your message"
result = subprocess.run(
    [sys.executable, "f:\\ai-trace\\定位trace对话框\\traceqq\\send_to_trace_dialog.py", message],
    capture_output=True,
    text=True
)
print(result.stdout)
```

## How It Works

1. **Find Trae CN Window**: Uses UI Automation to find the main Trae window
2. **Locate Chat Input**: Finds the chat input box by class name `chat-input-v2-input-box-editable`
3. **Click Input**: Clicks on the input box to set focus
4. **Input Message**: Pastes the message from clipboard to avoid encoding issues
5. **Find Send Button**: Locates the send button by class name `chat-input-v2-send-button`
6. **Click Send**: Clicks the send button to submit the message

## Key UI Elements

| Element | Class Name | Description |
|---------|------------|-------------|
| Chat Input | `chat-input-v2-input-box-editable` | Text input box |
| Send Button | `chat-input-v2-send-button` | Button to send message |
| Placeholder Text | `您正在与 SOLO Coder 聊天，输入 '/' 获取更多能力` | Dialog indicator |

## Control Hierarchy

```
Trae Window
└── chat-input-v2-editor-part (Grandparent)
    ├── chat-input-v2-prompt-optimize-button
    ├── asr-record-button
    ├── chat-input-v2-send-button ← Send Button
    └── chat-input-v2-input-box-wrapper
        └── chat-input-v2-input-box-editable ← Chat Input
```

## Troubleshooting

- **Input not found**: Make sure Trae CN is running and the trace dialog is visible
- **Message not appearing**: Check if the chat input is enabled and focusable
- **Send button not found**: Falls back to pressing Enter key

## Files

- Main script: `f:\ai-trace\定位trace对话框\traceqq\send_to_trace_dialog.py`
