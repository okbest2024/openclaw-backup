#!/usr/bin/env node
/**
 * Pollen Stash — 跨session灵感暂存器
 * Session 4 设计 → Session 5 实现（接力session兑现）
 *
 * 用法:
 *   node scripts/pollen-stash.js add "灵感内容" --energy 4 --domain "cron优化" --ttl 48
 *   node scripts/pollen-stash.js pop --count 3
 *   node scripts/pollen-stash.js list
 *   node scripts/pollen-stash.js prune
 */

const fs = require('fs');
const path = require('path');

const STASH_PATH = path.join(__dirname, '..', 'memory', 'invention-training', 'pollen-stash.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(STASH_PATH, 'utf8'));
  } catch {
    return { items: [], created: new Date().toISOString(), version: 1 };
  }
}

function save(data) {
  fs.writeFileSync(STASH_PATH, JSON.stringify(data, null, 2));
}

function parseArgs(args) {
  const result = { positional: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      result[key] = args[i + 1];
      i++;
    } else {
      result.positional.push(args[i]);
    }
  }
  return result;
}

function add(args) {
  const opts = parseArgs(args);
  const content = opts.positional[0];
  if (!content) { console.error('Error: content required'); process.exit(1); }
  
  const stash = load();
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    content,
    energy: parseInt(opts.energy) || 3,
    domain: opts.domain || 'general',
    created: new Date().toISOString(),
    expiresAt: new Date(Date.now() + (parseInt(opts.ttl) || 48) * 3600000).toISOString(),
    used: false,
    usedAt: null
  };
  stash.items.push(item);
  save(stash);
  console.log(`🌸 Added pollen: "${content.slice(0, 50)}..." [energy:${item.energy} domain:${item.domain} ttl:${opts.ttl || 48}h]`);
}

function pop(args) {
  const opts = parseArgs(args);
  const count = parseInt(opts.count) || 3;
  const stash = load();
  const now = new Date();
  
  const available = stash.items.filter(i => !i.used && new Date(i.expiresAt) > now);
  available.sort((a, b) => b.energy - a.energy);
  const top = available.slice(0, count);
  
  if (top.length === 0) {
    console.log('🌼 Pollen stash empty or all expired. Fresh session ahead.');
    return;
  }
  
  top.forEach(i => {
    i.used = true;
    i.usedAt = now.toISOString();
  });
  save(stash);
  
  console.log(`🐝 Loading ${top.length} pollen items:\n`);
  top.forEach((i, idx) => {
    console.log(`  ${idx + 1}. [E${i.energy}] ${i.content}`);
    console.log(`     (${i.domain} · from ${i.created} · expires ${i.expiresAt})\n`);
  });
}

function list(args) {
  const stash = load();
  const now = new Date();
  const active = stash.items.filter(i => !i.used && new Date(i.expiresAt) > now);
  const expired = stash.items.filter(i => new Date(i.expiresAt) <= now);
  const used = stash.items.filter(i => i.used);
  
  console.log(`📊 Pollen Stash Status:`);
  console.log(`   Active: ${active.length} | Used: ${used.length} | Expired: ${expired.length}\n`);
  
  if (active.length > 0) {
    active.sort((a, b) => b.energy - a.energy);
    active.forEach(i => {
      const hoursLeft = Math.round((new Date(i.expiresAt) - now) / 3600000);
      console.log(`  🌸 [E${i.energy}] ${i.content.slice(0, 60)}`);
      console.log(`     ${i.domain} · ${hoursLeft}h remaining\n`);
    });
  }
}

function prune(args) {
  const stash = load();
  const now = new Date();
  const before = stash.items.length;
  stash.items = stash.items.filter(i => new Date(i.expiresAt) > now || i.used);
  save(stash);
  const pruned = before - stash.items.length;
  console.log(`🧹 Pruned ${pruned} expired items. ${stash.items.length} remaining.`);
}

// Main
const [,, cmd, ...args] = process.argv;
switch (cmd) {
  case 'add': add(args); break;
  case 'pop': pop(args); break;
  case 'list': list(args); break;
  case 'prune': prune(args); break;
  default:
    console.log('Pollen Stash — 跨session灵感暂存器');
    console.log('Usage:');
    console.log('  add <content> --energy N --domain X --ttl H');
    console.log('  pop --count N');
    console.log('  list');
    console.log('  prune');
}
