/**
 * VersionedFile - 基于version的乐观锁文件操作
 * 
 * 配合WAL Manager使用，提供：
 * - version追踪（每次修改递增）
 * - 冲突检测（version不匹配时拒绝写入）
 * - 幂等更新（相同version重复写入不产生副作用）
 * 
 * v1.0 - 2026-03-28 第697次训练当场执行
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class VersionedFile {
  constructor(filePath) {
    this.filePath = filePath;
    this.metaPath = filePath + '.vmeta';
  }

  /**
   * 读取版本元数据
   */
  _readMeta() {
    if (!fs.existsSync(this.metaPath)) {
      return { version: 0, lastChecksum: null, lastModified: null };
    }
    return JSON.parse(fs.readFileSync(this.metaPath, 'utf8'));
  }

  /**
   * 写入版本元数据
   */
  _writeMeta(meta) {
    const fd = fs.openSync(this.metaPath, 'w');
    fs.writeSync(fd, JSON.stringify(meta, null, 2));
    fs.fsyncSync(fd);
    fs.closeSync(fd);
  }

  /**
   * 计算内容checksum
   */
  _checksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  /**
   * 获取当前version
   */
  getVersion() {
    return this._readMeta().version;
  }

  /**
   * 读取文件内容（附带version信息）
   */
  read() {
    const meta = this._readMeta();
    const content = fs.existsSync(this.filePath) 
      ? fs.readFileSync(this.filePath, 'utf8') 
      : null;
    
    return {
      content,
      version: meta.version,
      checksum: meta.lastChecksum,
      lastModified: meta.lastModified
    };
  }

  /**
   * 幂等写入（带version检查）
   * 
   * @param {string} content - 要写入的内容
   * @param {number} expectedVersion - 期望的当前version（-1表示不检查）
   * @returns {{ version: number, checksum: string }}
   */
  write(content, expectedVersion = -1) {
    const meta = this._readMeta();
    
    // version冲突检测
    if (expectedVersion >= 0 && meta.version !== expectedVersion) {
      throw new Error(
        `Version conflict: expected ${expectedVersion}, got ${meta.version} ` +
        `(file: ${this.filePath})`
      );
    }

    const newChecksum = this._checksum(content);
    
    // 幂等性检查：相同checksum不递增version
    if (newChecksum === meta.lastChecksum) {
      return { version: meta.version, checksum: newChecksum, idempotent: true };
    }

    // 写入文件 + fsync
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const fd = fs.openSync(this.filePath, 'w');
    fs.writeSync(fd, content);
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    // 更新元数据
    const newMeta = {
      version: meta.version + 1,
      lastChecksum: newChecksum,
      lastModified: new Date().toISOString()
    };
    this._writeMeta(newMeta);

    return { version: newMeta.version, checksum: newChecksum, idempotent: false };
  }

  /**
   * JSON专用读取
   */
  readJSON(defaultValue = {}) {
    const { content, version, checksum } = this.read();
    if (!content) return { data: defaultValue, version, checksum };
    try {
      return { data: JSON.parse(content), version, checksum };
    } catch {
      return { data: defaultValue, version: 0, checksum: null };
    }
  }

  /**
   * JSON幂等合并写入
   */
  mergeJSON(patch, expectedVersion = -1) {
    const { data: current } = this.readJSON();
    const merged = { ...current, ...patch };
    return this.write(JSON.stringify(merged, null, 2), expectedVersion);
  }
}

module.exports = { VersionedFile };

// CLI测试
if (require.main === module) {
  const testPath = path.join(__dirname, '..', '.vfile-test', 'test.json');
  const vf = new VersionedFile(testPath);

  console.log('[VF Test] Initial version:', vf.getVersion());
  
  const r1 = vf.write('{"hello": "world"}');
  console.log('[VF Test] Write 1:', r1);
  
  const r2 = vf.write('{"hello": "world"}'); // 幂等
  console.log('[VF Test] Write 2 (idempotent):', r2);
  
  const r3 = vf.mergeJSON({ added: true });
  console.log('[VF Test] Merge:', r3);
  
  const read = vf.readJSON();
  console.log('[VF Test] Read:', read);
  
  // 冲突测试
  try {
    vf.write('conflict', 0); // version已经不是0了
    console.log('[VF Test] ERROR: should have thrown');
  } catch (err) {
    console.log('[VF Test] Conflict detected:', err.message);
  }
  
  // 清理
  fs.rmSync(path.join(__dirname, '..', '.vfile-test'), { recursive: true });
  console.log('[VF Test] ✅ All tests passed!');
}
