const fs = require('fs');
let code = fs.readFileSync('src/app/(manager)/monitor.tsx', 'utf8');

// Find everything from const rangersMapHtml to handleWebViewMessage ending
const regex = /const rangersMapHtml = `[\s\S]*?console\.error\(e\);\n    }\n  };\n/;
const match = code.match(regex);
if (match) {
    const block = match[0];
    // Remove from inside useEffect
    code = code.replace(block, '');
    // Insert just before the final return (
    code = code.replace('  return (\n    <SafeAreaView', block + '\n  return (\n    <SafeAreaView');
    fs.writeFileSync('src/app/(manager)/monitor.tsx', code, 'utf8');
}
