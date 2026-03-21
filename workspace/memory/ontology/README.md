# Ontology Graph

## 实体类型
- Person, Project, Task, Goal
- Event, Document, Note
- Action, Policy

## 存储位置
`memory/ontology/graph.jsonl`

## 初始化时间
2026-03-21

## 使用说明
- 所有实体追加写入，不覆盖
- 每次修改后验证约束
- 定期清理孤立节点
