---
name: "openclaw-tui-sender"
description: "Send messages to OpenClaw TUI terminal. Invoke when user wants to send commands or messages to OpenClaw TUI, not to Trae CN SOLO Coder."
---

# OpenClaw TUI Sender

Send messages to OpenClaw TUI terminal and read responses using OCR.

## Purpose

When working in Trae CN, use this skill to send messages to OpenClaw TUI (running in a separate terminal) instead of sending to Trae CN's own SOLO Coder chat.

## Solution: OCR-Based Terminal Reading

Since blessed TUI uses full-screen rendering that cannot be captured by normal terminal output, we use **OCR (Optical Character Recognition)** to read the terminal screen:

1. **Capture screenshot** of the terminal window
2. **Use cnocr** to extract text from the screenshot
3. **Return the extracted text**

## Prerequisites

Install OCR library:

```bash
pip install cnocr onnxruntime
```

## Usage

### Send Message and Read Response (with OCR)

```bash
python "F:\ai-trace\定位trace对话框\test\.trae\skills\openclaw-tui-sender\send_and_read_ocr.py" "your message" [wait_seconds]
```

Example:
```bash
python "F:\ai-trace\定位trace对话框\test\.trae\skills\openclaw-tui-sender\send_and_read_ocr.py" "在吗" 10
```

### Send Message Only (without OCR)

```bash
python "F:\ai-trace\定位trace对话框\test\.trae\skills\openclaw-tui-sender\send_to_openclaw_tui.py" "your message"
```

### Start OpenClaw TUI in Separate Window

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "chcp 65001; openclaw tui"
```

### Check Gateway status

```powershell
openclaw gateway status
```

## Files

| File | Purpose |
|------|---------|
| `send_and_read_ocr.py` | Send message and read response using OCR |
| `send_to_openclaw_tui.py` | Send messages only (no OCR) |
| `read_openclaw_tui.py` | Read terminal using OCR only |

## Technical Details

### Why OCR?

- **blessed TUI** uses full-screen terminal rendering (like ncurses)
- Terminal output is not captured by normal stdout/stderr redirection
- **Windows Terminal** uses ConPTY which doesn't expose screen buffer API
- **OCR** is the most reliable way to read TUI content

### OCR Libraries Supported

1. **cnocr** (Recommended) - Best for Chinese/English mixed text
2. **easyocr** - Good multilingual support
3. **pytesseract** - Requires external Tesseract installation

## Related Skills

- `trae-trace-sender`: Send to Trae CN SOLO Coder (for receiving OpenClaw responses)
- `openclaw-config-fix`: Fix OpenClaw config issues
