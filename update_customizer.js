
const fs = require('fs');
const path = 'D:/storefy/src/components/admin/ThemeCustomizer.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('AIAssistantWidget')) {
    content = content.replace(
        "import React, { useState", 
        "import { AIAssistantWidget } from './AIAssistantWidget';\nimport React, { useState"
    );
    
    // Find the last </div> before the final }
    const lastDivIndex = content.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
        const insertion = "\n  <AIAssistantWidget blocks={blocks} onBlocksUpdate={(newBlocks) => { setBlocks(newBlocks); setHasUnsavedChanges(true); }} />\n";
        content = content.slice(0, lastDivIndex) + insertion + content.slice(lastDivIndex);
        fs.writeFileSync(path, content);
        console.log("Updated via Node.js");
    }
} else {
    console.log("Skipped");
}
