import uiautomation as auto
import sys
import time
import subprocess

def get_openclaw_tui_response():
    print("Looking for OpenClaw TUI window...")
    
    windows = auto.GetRootControl().GetChildren()
    target_window = None
    
    for win in windows:
        name = win.Name or ""
        classname = win.ClassName or ""
        
        if "CASCADIA_HOSTING_WINDOW_CLASS" in classname or "ConsoleWindowClass" in classname:
            if "openclaw" in name.lower():
                target_window = win
                print(f"Found OpenClaw TUI window: {name}")
                break
    
    if not target_window:
        print("Error: OpenClaw TUI window not found!")
        return None
    
    # Activate the window
    target_window.SetActive()
    time.sleep(0.3)
    
    # Try to select all and copy (Ctrl+A, Ctrl+C)
    print("Attempting to copy terminal content...")
    
    # Clear clipboard first
    subprocess.run(['powershell', '-command', 'Set-Clipboard -Value ""'], capture_output=True)
    
    # Select all (Ctrl+A might not work in terminal, try Ctrl+Shift+End)
    target_window.SendKeys("^{END}", waitTime=0.1)  # Ctrl+End to go to end
    target_window.SendKeys("+^{HOME}", waitTime=0.1)  # Shift+Ctrl+Home to select all
    
    # Copy
    target_window.SendKeys("^c", waitTime=0.3)
    
    # Get clipboard content
    result = subprocess.run(
        ['powershell', '-command', 'Get-Clipboard'],
        capture_output=True,
        text=True,
        encoding='utf-8'
    )
    
    content = result.stdout
    if content:
        print(f"\n=== Terminal Content ===\n{content[-3000:]}\n========================")
        return content
    
    print("Could not read terminal content via clipboard")
    return None

if __name__ == "__main__":
    get_openclaw_tui_response()
