---
name: "qq-bridge-responder"
description: "Read QQ messages from file queue and generate replies. Invoke when user says 'check qq messages', 'read incoming messages', or wants to respond to QQ bot messages."
---

# QQ Bridge Responder

## Purpose

Read incoming QQ messages from file queue (`incoming.jsonl`), generate replies, and write to outgoing queue (`outgoing.jsonl`).

## File Locations

- **Incoming**: `f:\ai-trace\tgmclaw\workdir\qq-bridge\incoming.jsonl`
- **Outgoing**: `f:\ai-trace\tgmclaw\workdir\qq-bridge\outgoing.jsonl`

## Workflow

1. **Read incoming messages** from `incoming.jsonl`
2. **Display messages** to user
3. **Generate reply** for each message
4. **Write reply** to `outgoing.jsonl`
5. **QQ Receiver** will automatically send replies

## Message Format

### Incoming (from QQ)
```json
{
  "timestamp": "2026-02-26T11:00:00.000Z",
  "channel": "703803D4A581F9AD7077E1C6B7D979BE",
  "user": "703803D4A581F9AD7077E1C6B7D979BE",
  "userName": "Unknown",
  "text": "Hello, how are you?",
  "isDirect": true,
  "replied": false
}
```

### Outgoing (to QQ)
```json
{
  "timestamp": "2026-02-26T11:00:00.000Z",
  "channel": "703803D4A581F9AD7077E1C6B7D979BE",
  "user": "703803D4A581F9AD7077E1C6B7D979BE",
  "userName": "Unknown",
  "text": "Hello, how are you?",
  "isDirect": true,
  "reply": "I'm doing great! How can I help you today?",
  "sent": false
}
```

## Steps

1. Read `incoming.jsonl`
2. Parse each message
3. For unreplied messages:
   - Display to user
   - Generate appropriate reply
   - Format as outgoing message
4. Append to `outgoing.jsonl`
5. Mark incoming messages as replied

## Example

When user says: "Check QQ messages"

1. Read `incoming.jsonl`
2. Show: "📩 Message from User: 'Hello'"
3. Generate reply: "Hi there! How can I help you?"
4. Write to `outgoing.jsonl`
5. Confirm: "✅ Reply queued for sending"
