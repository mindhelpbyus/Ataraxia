const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.dart')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('/Users/cvp/anti-gravity/Ataraxia/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/\bbg-orange-(50|100|200)\b/g, 'bg-action-light');
    content = content.replace(/\bbg-orange-300\b/g, 'bg-action-border');
    content = content.replace(/\bbg-orange-(400|500)\b/g, 'bg-action');
    content = content.replace(/\bbg-orange-(600|700|800|900|950)\b/g, 'bg-action-dark');
    content = content.replace(/\bfrom-orange-(50|100|200)\b/g, 'from-action-light');
    content = content.replace(/\bto-orange-(50|100|200)\b/g, 'to-action-light');
    content = content.replace(/\bfrom-orange-(400|500)\b/g, 'from-action');
    content = content.replace(/\bto-orange-(400|500)\b/g, 'to-action');
    
    // Text
    content = content.replace(/\btext-orange-(50|100|200)\b/g, 'text-action-light');
    content = content.replace(/\btext-orange-300\b/g, 'text-sage');
    content = content.replace(/\btext-orange-(400|500|600)\b/g, 'text-action');
    content = content.replace(/\btext-orange-(700|800|900|950)\b/g, 'text-action-dark');

    // Borders
    content = content.replace(/\bborder-orange-(50|100|200)\b/g, 'border-action-light');
    content = content.replace(/\bborder-orange-(300|400)\b/g, 'border-action-border');
    content = content.replace(/\bborder-orange-500\b/g, 'border-action');
    content = content.replace(/\bborder-orange-(600|700|800|900|950)\b/g, 'border-action-dark');
    content = content.replace(/\bhover:border-orange-[0-9]+\b/g, 'hover:border-action');

    // Rings and shadows
    content = content.replace(/\bring-orange-[0-9]+\b/g, 'ring-action');
    content = content.replace(/\bfocus:ring-orange-[0-9]+\b/g, 'focus:ring-action');
    content = content.replace(/\bshadow-orange-[0-9]+\/[0-9]+\b/g, 'shadow-action/20');
    
    // Hover states
    content = content.replace(/\bhover:bg-orange-(50|100|200)\b/g, 'hover:bg-action-light');
    content = content.replace(/\bhover:bg-orange-[3-9]00\b/g, 'hover:bg-action');
    content = content.replace(/\bhover:text-orange-[0-9]+\b/g, 'hover:text-action');

    // Arbitrary hex values and generic "orange" string where it acts as a color variant
    content = content.replace(/#F97316/gi, '#1E7048');
    content = content.replace(/#EA580C/gi, '#145C34');
    content = content.replace(/#FFF6ED/gi, 'var(--surface-sage)');
    content = content.replace(/#FFE0B2/gi, 'var(--surface-sage)');
    content = content.replace(/#FFCC80/gi, 'var(--action-light)');
    content = content.replace(/#FFA726/gi, 'var(--action-light)');

    // For things like variant="orange"
    // Leave the prop name `orange` alone if it's an enum, but make sure the CSS mapped to it uses action tokens

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log("Orange replaced via node");
