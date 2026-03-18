import uiautomation as auto
import sys
import time

def send_and_read(message, wait_time=10):
    print("Looking for OpenClaw TUI window...")
    
    windows = auto.GetRootControl().GetChildren()
    target_window = None
    
    for win in windows:
        name = win.Name or ""
        classname = win.ClassName or ""
        
        if "CASCADIA_HOSTING_WINDOW_CLASS" in classname or "ConsoleWindowClass" in classname:
            if "openclaw" in Name.lower():
                target_window = win
                print(f"Found OpenClaw TUI window: {Name}")
                break
    
    if not target_window:
        print("Error: OpenClaw TUI window not found!")
        return None
    
    # Activate and send message
    target_window.SetActive()
    time.sleep(0.3)
    
    print(f"Sending message: {message}")
    
    for char in message:
        if char == '\n':
            target_window.SendKeys("{Enter}", waitTime=0.01)
        elif char == '{':
            target_window.SendKeys("{{}", waitTime=0.01)
        elif char == '}':
            target_window.SendKeys("{}}", waitTime=0.01)
        else:
            target_window.SendKeys(char, waitTime=0.005)
    
    target_window.SendKeys("{Enter}", waitTime=0.1)
    
    print(f"Message sent! Waiting {wait_time} seconds for response...")
    time.sleep(wait_time)
    
    # Take a screenshot for debugging
    try:
        target_window.CaptureToImage("openclaw_tui_screenshot.png")
        print("Screenshot saved to openclaw_tui_screenshot.png")
    except Exception as e:
        print(f"Could not take screenshot: {e}")
    
    print("\nPlease check the OpenClaw TUI window for the response.")
    print("The terminal content cannot be read programmatically due to Windows Terminal limitations.")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python send_and_read.py \"your message\" [wait_seconds]")
        sys.exit(1)
    
    message = sys.argv[1]
    wait_time = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    send_and_read(message, wait_time)
