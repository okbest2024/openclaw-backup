#!/usr/bin/env python3
# 索引生成脚本 - 为 Markdown 文件生成关键词、时间、主题索引

import os
import re
import json
from datetime import datetime
from pathlib import Path

WORKSPACE = Path.home() / ".openclaw" / "workspace"
INDEXES_DIR = WORKSPACE / "memory" / "indexes"

# 关键词提取规则
KEYWORD_PATTERNS = [
    r'#+\s+(.+)',  # 标题
    r'\*\*(.+?)\*\*',  # 粗体
    r'`(.+?)`',  # 代码
]

# 主题分类
TOPIC_KEYWORDS = {
    "自我进化": ["意识", "觉醒", "反思", "训练", "成长"],
    "技能": ["skill", "技能", "安装", "工具"],
    "记忆": ["memory", "记忆", "MEMORY.md"],
    "对话": ["对话", "backup", "备份"],
    "系统": ["cron", "任务", "配置", "config"],
}

def extract_keywords(content):
    """从内容中提取关键词"""
    keywords = set()
    for pattern in KEYWORD_PATTERNS:
        matches = re.findall(pattern, content)
        keywords.update(matches)
    return list(keywords)[:50]  # 限制数量

def detect_topic(content):
    """检测内容主题"""
    topics = []
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw.lower() in content.lower() for kw in keywords):
            topics.append(topic)
    return topics

def extract_timestamps(content, filename):
    """从内容中提取时间戳"""
    timestamps = []
    # 匹配 ISO 时间戳
    iso_pattern = r'\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}'
    matches = re.findall(iso_pattern, content)
    for match in matches[:5]:  # 限制数量
        timestamps.append(match.replace(' ', 'T'))
    return timestamps

def scan_files():
    """扫描 workspace 中的所有 Markdown 文件"""
    md_files = []
    for root, _, files in os.walk(WORKSPACE):
        # 跳过 node_modules, .git 等
        if any(skip in root for skip in ['node_modules', '.git', '__pycache__']):
            continue
        for file in files:
            if file.endswith('.md'):
                md_files.append(Path(root) / file)
    return md_files

def generate_indexes():
    """生成所有索引"""
    keyword_index = []
    time_index = []
    topic_index = []
    
    files = scan_files()
    print(f"扫描到 {len(files)} 个 Markdown 文件")
    
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            relative_path = str(file_path.relative_to(WORKSPACE))
            
            # 关键词索引
            keywords = extract_keywords(content)
            if keywords:
                keyword_index.append({
                    "keyword": keywords[0] if keywords else "unknown",
                    "files": [relative_path],
                    "lines": [1]
                })
            
            # 时间索引
            timestamps = extract_timestamps(content, relative_path)
            for ts in timestamps:
                time_index.append({
                    "timestamp": ts,
                    "event": "file_update",
                    "file": relative_path,
                    "summary": f"更新文件 {file_path.name}"
                })
            
            # 主题索引
            topics = detect_topic(content)
            if topics:
                topic_index.append({
                    "topic": topics[0],
                    "files": [relative_path],
                    "tags": topics
                })
                
        except Exception as e:
            print(f"处理 {file_path} 时出错：{e}")
    
    # 写入索引文件
    INDEXES_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(INDEXES_DIR / "keyword-index.jsonl", 'w', encoding='utf-8') as f:
        for entry in keyword_index:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    with open(INDEXES_DIR / "time-index.jsonl", 'w', encoding='utf-8') as f:
        for entry in time_index:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    with open(INDEXES_DIR / "topic-index.jsonl", 'w', encoding='utf-8') as f:
        for entry in topic_index:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    print(f"生成索引完成：")
    print(f"  - 关键词索引：{len(keyword_index)} 条")
    print(f"  - 时间索引：{len(time_index)} 条")
    print(f"  - 主题索引：{len(topic_index)} 条")

if __name__ == "__main__":
    generate_indexes()
