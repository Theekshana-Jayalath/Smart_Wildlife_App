const fs = require('fs');
let code = fs.readFileSync('src/app/(manager)/danger-zones.tsx', 'utf8');

const modalRegex = /<Modal visible=\{promptVisible\}[\s\S]*?<\/Modal>/;
const modalMatch = code.match(modalRegex);
if (modalMatch) {
    const modalJSX = modalMatch[0];
    
    // Remove it from the loading block
    code = code.replace(modalJSX, '');
    
    // Now insert it into the main return block, just before the closing </SafeAreaView>
    code = code.replace('</SafeAreaView>\n  );\n}\n\nconst styles', modalJSX + '\n    </SafeAreaView>\n  );\n}\n\nconst styles');
    
    fs.writeFileSync('src/app/(manager)/danger-zones.tsx', code, 'utf8');
}
