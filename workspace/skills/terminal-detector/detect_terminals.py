import uiautomation as auto
import subprocess

def find_all_terminal_tabs():
    """查找所有终端标签页"""
    print("=" * 70)
    print("检测所有终端窗口和标签页")
    print("=" * 70)
    
    # 查找 Windows Terminal 窗口
    terminal_windows = []
    windows = auto.GetRootControl().GetChildren()
    
    for win in windows:
        classname = win.ClassName or ""
        name = win.Name or ""
        
        if "CASCADIA_HOSTING_WINDOW_CLASS" in classname:
            terminal_windows.append(win)
    
    total_tabs = 0
    
    for i, terminal in enumerate(terminal_windows):
        print(f"\n[{i+1}] Windows Terminal 窗口:")
        print(f"    窗口标题: {terminal.Name}")
        print(f"    进程ID: {terminal.ProcessId}")
        
        # 查找标签页
        tabs = terminal.TabItemControl()
        if tabs.Exists:
            # 可能有多个标签页
            tab_list = []
            
            def find_tab_items(control):
                classname = control.ClassName or ""
                control_type = control.ControlTypeName or ""
                
                if control_type == "TabItemControl":
                    tab_list.append(control)
                
                for child in control.GetChildren():
                    find_tab_items(child)
            
            find_tab_items(terminal)
            
            print(f"    标签页数量: {len(tab_list)}")
            
            for j, tab in enumerate(tab_list):
                total_tabs += 1
                tab_name = tab.Name or "(无标题)"
                print(f"      [{j+1}] 标签页: {tab_name}")
        else:
            # 单个标签页
            total_tabs += 1
            print(f"    标签页: {terminal.Name}")
    
    # 查找独立的 PowerShell/CMD 窗口
    print("\n" + "-" * 70)
    print("独立终端窗口:")
    
    for win in windows:
        name = win.Name or ""
        classname = win.ClassName or ""
        
        # 检测独立的控制台窗口
        if "ConsoleWindowClass" in classname and "CASCADIA" not in classname:
            print(f"  - {name} (ConsoleWindowClass, PID: {win.ProcessId})")
            total_tabs += 1
    
    print("\n" + "=" * 70)
    print(f"总计: {total_tabs} 个终端/标签页")
    print("=" * 70)

if __name__ == "__main__":
    find_all_terminal_tabs()
