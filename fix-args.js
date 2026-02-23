const fs = require('fs');
const glob = require('glob');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace get(url, boolean) -> get(url)
  content = content.replace(/(get(?:<[^>]+>)?\([^,]+),\s*(?:true|false)\)/g, '$1)');
  
  // Replace post(url, data, boolean) -> post(url, data)
  content = content.replace(/(post(?:<[^>]+>)?\([^,]+,\s*[^,]+),\s*(?:true|false)\)/g, '$1)');
  
  // Replace post(url, undefined, boolean) -> post(url)
  content = content.replace(/(post(?:<[^>]+>)?\([^,]+),\s*undefined,\s*(?:true|false)\)/g, '$1)');
  
  // Replace del(url, boolean) -> del(url)
  content = content.replace(/(del(?:<[^>]+>)?\([^,]+),\s*(?:true|false)\)/g, '$1)');
  
  // Replace requireAuth: false
  content = content.replace(/\{.*?requireAuth:\s*(?:true|false).*?\}/g, (match) => {
    return match.replace(/\s*requireAuth:\s*(?:true|false),?\s*/, '').replace(/\{\s*\}/, '{}');
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
}

const files = glob.sync('src/**/*.{ts,tsx}');
files.forEach(fixFile);
