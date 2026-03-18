#!/usr/bin/env python3
# simple_websearch.py — 简化的 AutoGLM Web Search (无需本地 token 服务)
# 用法: python simple_websearch.py "搜索关键词"

import sys
import json
import hashlib
import time
import urllib.request

# ── 配置 ──────────────────────────────────────────
APP_ID    = "100003"
APP_KEY   = "38d2391985e2369a5fb8227d8e6cd5e5"
URL       = "https://autoglm-api.zhipuai.cn/agentdr/v1/assistant/skills/web-search"

# ── 读取搜索词 ────────────────────────────
if len(sys.argv) < 2:
    print("用法：python simple_websearch.py \"搜索关键词\"")
    sys.exit(1)

query = sys.argv[1]

# ── 生成签名 Headers ──────────────────────────────
timestamp = str(int(time.time()))
sign_data = f"{APP_ID}&{timestamp}&{APP_KEY}"
sign      = hashlib.md5(sign_data.encode("utf-8")).hexdigest()

# ── 发起请求 ──────────────────────────────
payload = json.dumps({"queries": [{"query": query}]}).encode("utf-8")
headers = {
    "Content-Type":     "application/json",
    "X-Auth-Appid":     APP_ID,
    "X-Auth-TimeStamp": timestamp,
    "X-Auth-Sign":      sign,
}

try:
    req = urllib.request.Request(URL, data=payload, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        
    # 解析结果
    if result.get("code") == 0 and "data" in result:
        data = result["data"]
        if "results" in data:
            for r in data["results"]:
                if "webPages" in r and "value" in r["webPages"]:
                    items = r["webPages"]["value"][:5]
                    for item in items:
                        name = item.get("name", "")
                        url = item.get("url", "")
                        snippet = item.get("snippet", "")
                        print(f"标题：{name}")
                        print(f"链接：{url}")
                        print(f"摘要：{snippet}")
                        print("-" * 80)
    else:
        print(f"API 返回错误：{result}")
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
