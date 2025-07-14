export function isCode(text: string) {
  // 空内容直接返回
  if (!text) return false;
  
  // 特征权重计分
  let score = 0;
  
  // 1. 检查关键字
  const keywords = ['function', 'var', 'const', 'if', 'for', 'return', 'class'];
  if (keywords.some(kw => text.includes(kw))) score += 2;
  
  // 2. 检查特殊符号
  const symbols = ['{', '}', ';', '=', '(', ')', '<', '>'];
  if (symbols.some(sym => text.includes(sym))) score += 1;
  
  // 3. 检查注释
  if (text.includes('//') || text.includes('/*')) score += 2;
  
  // 4. 检查缩进（代码通常有规律缩进）
  const lines = text.split('\n');
  if (lines.length > 1) {
    const indentCount = lines.filter(line => line.startsWith('  ') || line.startsWith('\t')).length;
    if (indentCount > lines.length * 0.5) score += 1;
  }
  
  // 阈值判定（可根据需求调整）
  return score >= 1;
}