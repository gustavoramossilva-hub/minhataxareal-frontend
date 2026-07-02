/**
 * Script de ofuscação — extrai blocos <script> inline do HTML,
 * ofusca com javascript-obfuscator e reescreve o arquivo.
 *
 * Uso: node scripts/obfuscate.js [arquivo.html]
 * Padrão: simulador.html
 */
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const target = process.argv[2] || 'simulador.html';
const filePath = path.resolve(__dirname, '..', target);

if (!fs.existsSync(filePath)) {
  console.error(`Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

const html = fs.readFileSync(filePath, 'utf8');

// Substitui cada bloco <script>...</script> (sem src) pelo JS ofuscado
const result = html.replace(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi, (match, code) => {
  if (!code.trim()) return match;
  try {
    const obfuscated = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      disableConsoleOutput: false,
      identifierNamesGenerator: 'mangled',
      renameGlobals: false,
      selfDefending: false,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.5,
      transformObjectKeys: false,
    }).getObfuscatedCode();
    return match.replace(code, '\n' + obfuscated + '\n');
  } catch (e) {
    console.warn(`Aviso: bloco ignorado (${e.message.slice(0, 60)})`);
    return match;
  }
});

const outPath = filePath.replace(/\.html$/, '.min.html');
fs.writeFileSync(outPath, result, 'utf8');
console.log(`✓ Ofuscado: ${path.basename(outPath)}`);
