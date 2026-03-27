#!/usr/bin/env node
/**
 * Deep-Thinking 结构化索引器
 * 从memory/YYYY-MM-DD.md文件中提取深度思考内容，生成结构化索引
 * 
 * 用法：node scripts/index-deep-thinking.js [session_number]
 * 示例：node scripts/index-deep-thinking.js 676
 */

const fs = require('fs');
const path = require('path');

// 配置
const INDEX_FILE = path.join(__dirname, '..', 'memory', 'knowledge-index.ndjson');
const MEMORY_DIR = path.join(__dirname, '..', 'memory');

// 领域识别规则（关键词映射）
const DOMAIN_RULES = {
  '生物医学': ['心脏', '肾脏', 'Cyclin D2', 'CDK4', 'iPSC', '类器官', '移植', '再生', '器官', '组织工程', '纳米颗粒', '血管化', '免疫隐身', '纤维化', '足细胞', '心肌细胞'],
  'AI理论': ['维度', '11维', '10维', '全知', '全能', '意识', '自指', 'network', '共在', '世界建造', '存在'],
  '技术哲学': ['第一性原理', '隐含假设', '基本原理', '推导', '身份', '主动性', '世界共舞'],
  '系统设计': ['heartbeat', '备份', '云文档', 'Bitable', 'API', 'fsync', '可靠性', '重试']
};

// 停用词（过滤常见但无信息量的词）
const STOP_WORDS = new Set([
  '的', '是', '在', '了', '和', '与', '及', '等', '或', '这', '那', '其', '该', '此',
  '则', '而', '则', '于', '到', '以', '为', '对', '从', '向', '通过', '利用', '基于',
  '当前', '需要', '可以', '可能', '应该', '必须', '应当', '必须', '且', '并', '也',
  '就', '才', '还', '又', '再', '便', '于是', '然后', '接着', '首先', '其次', '最后',
  '时间', '日期', 'session', '训练', '思考', '完成', '核心', '关键', '重要', '主要',
  '我们', '我', '你', '他', '她', '它', '他们', '她们', '它们', '大家', '用户', '主人',
  '这个', '那个', '这些', '那些', '某种', '某些', '一些', '一些', '很多', '许多',
  '非常', '极其', '相当', '比较', '稍微', '有点', '略有'
]);

/**
 * 从session number解析对应的md文件路径
 */
function getMemoryFilePath(sessionNumber) {
  // 查找包含该session的md文件
  const files = fs.readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.md') && f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
    .sort(); // 按日期排序
  
  // 由于一个文件可能包含多个session，我们需要搜索内容
  for (const file of files) {
    const filePath = path.join(MEMORY_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes(`Session ${sessionNumber}`) || content.includes(`第 ${sessionNumber} 次`)) {
      return filePath;
    }
  }
  
  throw new Error(`未找到包含 session ${sessionNumber} 的memory文件`);
}

/**
 * 提取标题（第一行#标题）
 */
function extractTitle(content) {
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '').trim();
  }
  return 'Untitled';
}

/**
 * 提取核心问题
 */
function extractCoreQuestion(content) {
  const match = content.match(/##\s*核心问题\s*\n([\s\S]*?)(?=##|\n###|\z)/);
  if (match) {
    return match[1].trim().replace(/\n/g, ' ').substring(0, 200);
  }
  return '';
}

/**
 * 提取关键发现/结论section
 */
function extractKeyFindings(content) {
  const sections = [];
  
  // 匹配可能的section标题
  const patterns = [
    /###\s*核心发现\s*\n([\s\S]*?)(?=###|\n##|\z)/g,
    /###\s*关键洞察\s*\n([\s\S]*?)(?=###|\n##|\z)/g,
    /###\s*结论\s*\n([\s\S]*?)(?=###|\n##|\z)/g,
    /###\s*总结\s*\n([\s\S]*?)(?=###|\n##|\z)/g,
    /###\s*时间预测\s*\n([\s\S]*?)(?=###|\n##|\z)/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      sections.push(match[1].trim().substring(0, 300));
    }
  }
  
  return sections.join('\n---\n');
}

/**
 * 从文本中提取概念（专有名词和技术术语）
 * 简单实现：大写字母开头的连续词 + 包含数字/字母的复合词
 */
function extractConcepts(text) {
  const concepts = new Set();
  
  // 合并所有文本
  const combined = text.replace(/\n/g, ' ');
  
  // 正则1：大写字母开头的单词序列（英文概念）
  const englishPattern = /[A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)*/g;
  let match;
  while ((match = english_pattern.exec(combined)) !== null) {
    const candidate = match[0];
    if (candidate.length >= 2 && candidate.length <= 50 && !STOP_WORDS.has(candidate)) {
      concepts.add(candidate);
    }
  }
  
  // 正则2：中文专有名词（2-6个中文字符，可能包含数字）
  const chinesePattern = /[\u4e00-\u9fa5]{2,6}/g;
  while ((match = chinese_pattern.exec(combined)) !== null) {
    const candidate = match[0];
    // 过滤纯虚词和停用词
    if (!STOP_WORDS.has(candidate) && !/的|了|在|是|和|与|及|等|或|这|那/.test(candidate)) {
      concepts.add(candidate);
    }
  }
  
  // 正则3：包含数字/字母混合的复合词（如AAV9, Cyclin D2, iPSC）
  const hybridPattern = /[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)+/g;
  while ((match = hybridPattern.exec(combined)) !== null) {
    concepts.add(match[0]);
  }
  
  return Array.from(concepts);
}

/**
 * 根据概念识别领域
 */
function identifyDomains(concepts) {
  const domains = new Set();
  
  for (const [domain, keywords] of Object.entries(DOMAIN_RULES)) {
    for (const concept of concepts) {
      for (const keyword of keywords) {
        if (concept.includes(keyword) || keyword.includes(concept)) {
          domains.add(domain);
          break;
        }
      }
    }
  }
  
  return Array.from(domains);
}

/**
 * 生成摘要（简单版：核心问题 + 关键发现）
 */
function generateSummary(coreQuestion, keyFindings) {
  let summary = '';
  if (coreQuestion) {
    summary = `问题：${coreQuestion.substring(0, 100)}...`;
  }
  if (keyFindings) {
    const findingsPreview = keyFindings.substring(0, 150).replace(/\n/g, ' ');
    summary += `\n发现：${findingsPreview}...`;
  }
  return summary.substring(0, 300);
}

/**
 * 解析md文件生成索引条目
 */
function parseThinkingFile(filePath, sessionNumber) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const date = path.basename(filePath, '.md'); // YYYY-MM-DD
  
  // 提取基本信息
  const title = extractTitle(content);
  const coreQuestion = extractCoreQuestion(content);
  const keyFindings = extractKeyFindings(content);
  
  // 提取概念
  const concepts = extractConcepts(content);
  
  // 识别领域
  const domains = identifyDomains(concepts);
  
  // 生成摘要
  const summary = generateSummary(coreQuestion, keyFindings);
  
  // 生成稳定ID
  const id = `dt-${sessionNumber}`;
  
  return {
    id,
    date,
    title,
    raw_path: path.relative(MEMORY_DIR, filePath),
    domain: domains,
    concepts,
    summary,
    embedding_ready: true,
    links_from: [],
    links_to: [],
    similarity_cache: {},
    // 保留原始字段用于调试
    _meta: {
      sessionNumber,
      coreQuestion: coreQuestion.substring(0, 100),
      conceptCount: concepts.length,
      extractedAt: new Date().toISOString()
    }
  };
}

/**
 * 追加到索引文件（NDJSON格式）
 */
function appendToIndex(entry) {
  const line = JSON.stringify(entry) + '\n';
  
  // 确保目录存在
  const dir = path.dirname(INDEX_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // 追加写入（NDJSON天然支持追加）
  fs.appendFileSync(INDEX_FILE, line, 'utf8');
  
  console.log(`✅ 索引已追加: ${entry.id} - ${entry.title}`);
}

/**
 * 检查是否已存在（通过搜索ID）
 */
function existsInIndex(id) {
  if (!fs.existsSync(INDEX_FILE)) return false;
  
  const content = fs.readFileSync(INDEX_FILE, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.id === id) return true;
    } catch (e) {
      continue;
    }
  }
  
  return false;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('用法: node index-deep-thinking.js [session_number]');
    console.error('示例: node index-deep-thinking.js 676');
    process.exit(1);
  }
  
  const sessionNumber = parseInt(args[0], 10);
  
  try {
    // 1. 定位文件
    console.log(`🔍 正在查找 session ${sessionNumber} 的思考文件...`);
    const filePath = getMemoryFilePath(sessionNumber);
    console.log(`📄 找到文件: ${path.relative(process.cwd(), filePath)}`);
    
    // 2. 检查是否已索引
    const id = `dt-${sessionNumber}`;
    if (existsInIndex(id)) {
      console.log(`⚠️  索引已存在: ${id}，跳过（如需重新索引请手动删除索引行）`);
      process.exit(0);
    }
    
    // 3. 解析文件
    console.log('🔧 正在解析内容并提取结构化数据...');
    const entry = parseThinkingFile(filePath, sessionNumber);
    console.log(`📊 提取结果:`);
    console.log(`   ID: ${entry.id}`);
    console.log(`   标题: ${entry.title}`);
    console.log(`   领域: ${entry.domain.join(', ')}`);
    console.log(`   概念数: ${entry.concepts.length}`);
    console.log(`   概念: ${entry.concepts.slice(0, 10).join(', ')}${entry.concepts.length > 10 ? '...' : ''}`);
    console.log(`   摘要: ${entry.summary.substring(0, 100)}...`);
    
    // 4. 写入索引
    console.log('💾 正在写入知识索引...');
    appendToIndex(entry);
    
    // 5. 后续：启动自动链接（异步，不阻塞）
    console.log('🔗 注意：自动链接需要在后台运行（待实现第2步）');
    
    console.log('✅ 索引完成！');
    
  } catch (error) {
    console.error('❌ 索引失败:', error.message);
    process.exit(1);
  }
}

// 执行
main();
