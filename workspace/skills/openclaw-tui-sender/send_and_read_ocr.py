import ctypes
from ctypes import wintypes
import sys
import time
import os
from PIL import Image, ImageGrab

# Win32 API 定义
user32 = ctypes.windll.user32

EnumWindows = user32.EnumWindows
EnumWindowsProc = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
GetWindowTextLength = user32.GetWindowTextLengthW
GetWindowText = user32.GetWindowTextW
GetClassName = user32.GetClassNameW
GetWindowThreadProcessId = user32.GetWindowThreadProcessId
IsWindowVisible = user32.IsWindowVisible
IsIconic = user32.IsIconic
SetForegroundWindow = user32.SetForegroundWindow
ShowWindow = user32.ShowWindow
GetWindowRect = user32.GetWindowRect
SetWindowPos = user32.SetWindowPos
SetCursorPos = user32.SetCursorPos
mouse_event = user32.mouse_event

SW_RESTORE = 9
SW_SHOW = 5
SWP_NOZORDER = 0x0004
SWP_SHOWWINDOW = 0x0040
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004

def find_openclaw_tui_window():
    """使用 Win32 API 查找 openclaw-tui 窗口"""
    windows = []
    
    def enum_windows_proc(hwnd, lParam):
        if IsWindowVisible(hwnd):
            length = GetWindowTextLength(hwnd)
            if length > 0:
                buffer = ctypes.create_unicode_buffer(length + 1)
                GetWindowText(hwnd, buffer, length + 1)
                title = buffer.value
                
                class_buffer = ctypes.create_unicode_buffer(256)
                GetClassName(hwnd, class_buffer, 256)
                classname = class_buffer.value
                
                pid = wintypes.DWORD()
                GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
                
                # 查找包含 "openclaw" 但不包含 "gateway" 的窗口（TUI 窗口）
                title_lower = title.lower()
                if "openclaw" in title_lower and "gateway" not in title_lower:
                    windows.append({
                        'hwnd': hwnd,
                        'title': title,
                        'classname': classname,
                        'pid': pid.value
                    })
        
        return True
    
    EnumWindows(EnumWindowsProc(enum_windows_proc), 0)
    return windows

def get_window_rect(hwnd):
    """获取窗口位置和大小"""
    rect = wintypes.RECT()
    GetWindowRect(hwnd, ctypes.byref(rect))
    return (rect.left, rect.top, rect.right, rect.bottom)

def move_window_to_front_left(hwnd):
    """将窗口移动到左上角并激活"""
    print(f"  移动窗口 {hwnd} 到左上角...")
    
    # 检查窗口是否最小化
    if IsIconic(hwnd):
        print("    窗口被最小化，正在恢复...")
        ShowWindow(hwnd, SW_RESTORE)
        time.sleep(0.5)
    
    # 显示窗口
    ShowWindow(hwnd, SW_SHOW)
    time.sleep(0.3)
    
    # 获取当前窗口大小
    rect = get_window_rect(hwnd)
    width = rect[2] - rect[0]
    height = rect[3] - rect[1]
    
    # 如果窗口位置无效（被最小化到任务栏），使用默认大小
    if rect[0] < -10000 or rect[1] < -10000:
        print("    窗口位置无效，使用默认大小...")
        width = 800
        height = 600
    
    # 移动到左上角 (100, 100) - 避免被任务栏遮挡
    print(f"    移动到 (100, 100)，大小: {width}x{height}")
    SetWindowPos(hwnd, 0, 100, 100, width, height, SWP_NOZORDER | SWP_SHOWWINDOW)
    time.sleep(0.5)
    
    # 放到最前面
    SetWindowPos(hwnd, -1, 0, 0, 0, 0, 0x0001 | 0x0004)
    time.sleep(0.3)
    
    # 激活窗口
    SetForegroundWindow(hwnd)
    time.sleep(0.5)
    
    # 获取新位置
    new_rect = get_window_rect(hwnd)
    print(f"    窗口新位置: {new_rect}")
    
    # 点击窗口中心
    center_x = (new_rect[0] + new_rect[2]) // 2
    center_y = (new_rect[1] + new_rect[3]) // 2
    SetCursorPos(center_x, center_y)
    time.sleep(0.3)
    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.1)
    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    time.sleep(0.3)
    
    print(f"  窗口已移动到左上角并激活")

def send_keys_to_window(hwnd, text):
    """发送按键到窗口"""
    import uiautomation as auto
    
    control = auto.ControlFromHandle(hwnd)
    if control:
        for char in text:
            if char == '\n':
                control.SendKeys("{Enter}", waitTime=0.02)
            elif char == '{':
                control.SendKeys("{{}", waitTime=0.02)
            elif char == '}':
                control.SendKeys("{}}", waitTime=0.02)
            else:
                control.SendKeys(char, waitTime=0.01)
        control.SendKeys("{Enter}", waitTime=0.1)
        return True
    return False

def capture_window_screenshot(hwnd, save_path="tui_screenshot.png"):
    """使用 PIL 截图窗口区域"""
    try:
        # 确保窗口在最前面
        move_window_to_front_left(hwnd)
        time.sleep(0.5)
        
        # 获取窗口区域
        rect = get_window_rect(hwnd)
        print(f"  窗口区域: {rect}")
        
        # 检查窗口位置是否有效
        if rect[0] < -10000 or rect[1] < -10000:
            print("  错误: 窗口位置无效")
            return None
        
        # 截取整个屏幕
        screenshot = ImageGrab.grab()
        
        # 裁剪窗口区域
        window_img = screenshot.crop(rect)
        window_img.save(save_path)
        
        # 检查图片大小
        img_size = os.path.getsize(save_path)
        print(f"  截图已保存: {save_path}, 大小: {img_size} bytes")
        
        if img_size < 1000:
            print("  警告: 截图太小，可能没有正确捕获")
        
        return save_path
    except Exception as e:
        print(f"  截图失败: {e}")
        return None

def ocr_extract_text(image_path):
    """使用 OCR 提取文本"""
    try:
        from cnocr import CnOcr
        ocr = CnOcr()
        result = ocr.ocr(image_path)
        text = "\n".join([line['text'] for line in result])
        print("使用 cnocr 进行 OCR")
        return text
    except Exception as e:
        print(f"OCR 失败: {e}")
        return None

def send_and_read_ocr(message, wait_time=15):
    """发送消息到 OpenClaw TUI 并使用 OCR 读取回复"""
    print("=" * 60)
    print("OpenClaw TUI 发送器 (Win32 API + OCR)")
    print("=" * 60)
    
    # 查找 openclaw-tui 窗口
    print("\n[1/4] 查找 openclaw-tui 窗口...")
    windows = find_openclaw_tui_window()
    
    if not windows:
        print("错误: 未找到 openclaw-tui 窗口!")
        return None
    
    win = windows[0]
    print(f"✓ 找到窗口: {win['title']}")
    print(f"  窗口句柄: {win['hwnd']}")
    print(f"  进程ID: {win['pid']}")
    
    # 移动窗口到左上角并激活
    print("\n[2/4] 移动窗口到左上角...")
    move_window_to_front_left(win['hwnd'])
    
    print(f"  消息: {message[:50]}{'...' if len(message) > 50 else ''}")
    
    # 发送消息
    if send_keys_to_window(win['hwnd'], message):
        print("✓ 消息已发送")
    else:
        print("错误: 发送消息失败")
        return None
    
    # 等待回复
    print(f"\n[3/4] 等待 {wait_time} 秒获取回复...")
    time.sleep(wait_time)
    
    # 截图并 OCR
    print("\n[4/4] 截图并读取回复...")
    
    screenshot_path = capture_window_screenshot(win['hwnd'])
    
    if not screenshot_path:
        return None
    
    text = ocr_extract_text(screenshot_path)
    
    if text:
        print("\n" + "=" * 60)
        print("OCR 结果:")
        print("=" * 60)
        print(text)
        print("=" * 60)
    else:
        print("未获取到 OCR 结果")
    
    return text

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python send_and_read_ocr.py \"你的消息\" [等待秒数]")
        print("\n需要 OCR 库: pip install cnocr onnxruntime")
        sys.exit(1)
    
    message = sys.argv[1]
    wait_time = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    
    send_and_read_ocr(message, wait_time)
