/**
 * @type {import('prettier').Config}
 */
export default {
  // 每行最大字符数
  printWidth: 100,
  // 缩进空格数
  tabWidth: 2,
  // 使用空格而不是制表符
  useTabs: false,
  // 语句末尾不加分号
  semi: false,
  // 使用单引号
  singleQuote: true,
  // 对象属性引号：仅在需要时添加
  quoteProps: 'as-needed',
  // JSX 中使用单引号
  jsxSingleQuote: false,
  // 尾随逗号：ES5 标准（对象、数组等）
  trailingComma: 'es5',
  // 对象字面量的大括号间添加空格
  bracketSpacing: true,
  // 箭头函数单个参数不加括号
  arrowParens: 'avoid',
  // Vue 文件中 <script> 和 <style> 标签内的代码缩进
  vueIndentScriptAndStyle: false,
  // 换行符：LF (Unix/Mac)
  endOfLine: 'lf',
  // HTML 空白敏感
  htmlWhitespaceSensitivity: 'css',
}
