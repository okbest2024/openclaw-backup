import ctypes
from ctypes import wintypes
import subprocess

# Win32 API 定义
user32 = ctypes.windll.user32

EnumWindows = user32.EnumWindows
EnumWindowsProc = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
GetWindowTextLength = user32.GetWindowTextLengthW
GetWindowText = user32.GetWindowTextW
GetClassName = user32.GetClassNameW
GetWindowThreadProcessId = user32.GetWindowThreadProcessId
IsWindowVisible = user32.IsWindowVisible

def get_all_windows():
    """使用 Win32 API 获取所有窗口"""
    windows = []
    
    def enum_windows_proc(hwnd, lParam):
        if IsWindowVisible(hwnd):
            # 获取窗口标题
            length = GetWindowTextLength(hwnd)
            if length > 0:
                buffer = ctypes.create_unicode_buffer(length + 1)
                GetWindowText(hwnd, buffer, length + 1)
                title = buffer.value
                
                # 获取窗口类名
                class_buffer = ctypes.create_unicode_buffer(256)
                GetClassName(hwnd, class_buffer, 256)
                classname = class_buffer.value
                
                # 获取进程 ID
                pid = wintypes.DWORD()
                GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
                
                windows.append({
                    'hwnd': hwnd,
                    'title': title,
                    'classname': classname,
                    'pid': pid.value
                })
        
        return True
    
    EnumWindows(EnumWindowsProc(enum_windows_proc), 0)
    return windows

def find_terminal_windows():
    """查找所有终端窗口"""
    print("=" * 70)
    print("使用 Win32 API 检测所有终端窗口")
    print("=" * 70)
    
    all_windows = get_all_windows()
    
    terminal_count = 0
    
    for win in all_windows:
        title = win['title']
        classname = win['classname']
        pid = win['pid']
        
        # 检测终端相关窗口
        is_terminal = (
            'PowerShell' in title or 
            'CASCADIA' in classname or 
            'ConsoleWindowClass' in classname or
            'cmd' in title.lower() or
            '管理员' in title or
            'Terminal' in title or
            'Command Prompt' in title or
            'CMD' in title
        )
        
        if is_terminal:
            terminal_count += 1
            
            # 获取进程名
            try:
                proc = subprocess.run(
                    ['tasklist', '/FI', f'PID eq {pid}', '/FO', 'CSV', '/NH'],
                    capture_output=True,
                    text=True
                )
                proc_info = proc.stdout.strip()
            except:
                proc_info = "Unknown"
            
            print(f"\n[{terminal_count}] 终端窗口:")
            print(f"    窗口标题: {title}")
            print(f"    窗口类名: {classname}")
            print(f"    窗口句柄: {win['hwnd']}")
            print(f"    进程ID: {pid}")
            print(f"    进程信息: {proc_info}")
    
    print("\n" + "=" * 70)
    print(f"总计: {terminal_count} 个终端窗口")
    print("=" * 70)

if __name__ == "__main__":
    find_terminal_windows()
