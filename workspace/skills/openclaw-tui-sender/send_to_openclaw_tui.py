import uiautomation as auto
import sys
import time
import subprocess
import os

def check_gateway():
    """Check if OpenClaw Gateway is running"""
    result = subprocess.run(
        ['openclaw', 'gateway', 'status'],
        capture_output=True,
        text=True,
        shell=True
    )
    return 'RPC probe: ok' in result.stdout or 'Listening' in result.stdout

def start_gateway():
    """Start OpenClaw Gateway"""
    print("Starting OpenClaw Gateway...")
    subprocess.run(['openclaw', 'gateway', 'start'], shell=True, capture_output=True)
    time.sleep(3)

def find_tui_windows():
    """Find all OpenClaw TUI windows"""
    windows = auto.GetRootControl().GetChildren()
    tui_windows = []
    
    for win in windows:
        name = win.Name or ""
        classname = win.ClassName or ""
        
        # Check for terminal windows
        if "CASCADIA_HOSTING_WINDOW_CLASS" in classname or "ConsoleWindowClass" in classname:
            tui_windows.append((win, name, classname))
    
    return tui_windows

def find_connected_tui():
    """Find a TUI that is connected to gateway"""
    windows = auto.GetRootControl().GetChildren()
    
    for win in windows:
        name = win.Name or ""
        classname = win.ClassName or ""
        
        # Check for terminal windows with openclaw in name
        if "CASCADIA_HOSTING_WINDOW_CLASS" in classname or "ConsoleWindowClass" in classname:
            if "openclaw" in name.lower():
                return win, name
    
    # If no openclaw window found, return first terminal
    for win in windows:
        name = win.Name or ""
        classname = win.ClassName or ""
        
        if "CASCADIA_HOSTING_WINDOW_CLASS" in classname:
            return win, name
    
    return None, None

def send_to_openclaw_tui(message):
    print("=" * 50)
    print("OpenClaw TUI Sender")
    print("=" * 50)
    
    # Step 1: Check Gateway
    print("\n[1/3] Checking OpenClaw Gateway...")
    if not check_gateway():
        print("Gateway not running, starting...")
        start_gateway()
        if not check_gateway():
            print("ERROR: Failed to start Gateway!")
            return False
    print("✓ Gateway is running")
    
    # Step 2: Find existing TUI (don't start new one)
    print("\n[2/3] Looking for OpenClaw TUI...")
    
    # First, list all terminal windows
    tui_windows = find_tui_windows()
    if tui_windows:
        print(f"Found {len(tui_windows)} terminal window(s):")
        for win, name, classname in tui_windows:
            print(f"  - {name} ({classname})")
    
    # Find connected TUI
    target_window, window_name = find_connected_tui()
    
    if not target_window:
        print("\nERROR: No TUI window found!")
        print("Please make sure OpenClaw TUI is running in a terminal window.")
        print("You can start it manually with: openclaw tui")
        return False
    
    print(f"✓ Found TUI: {window_name}")
    
    # Step 3: Send message
    print("\n[3/3] Sending message...")
    print(f"Message: {message[:50]}{'...' if len(message) > 50 else ''}")
    
    target_window.SetActive()
    time.sleep(0.5)
    
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
    
    print("\n" + "=" * 50)
    print("✓ Message sent successfully!")
    print("=" * 50)
    print("\nPlease check the OpenClaw TUI window for response.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python send_to_openclaw_tui.py \"your message\"")
        sys.exit(1)
    
    message = sys.argv[1]
    send_to_openclaw_tui(message)
