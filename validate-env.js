const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Frontend environment configuration...\n');

const envFile = path.join(__dirname, '.env.local');

if (!fs.existsSync(envFile)) {
    console.log(`❌ .env.local does not exist`);
    console.log(`💡 Run 'node scripts/setup-env.js' to create it locally.`);
    process.exit(1);
}

console.log(`📄 Checking .env.local...`);

const content = fs.readFileSync(envFile, 'utf8');
const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
const env = {};

for (const line of lines) {
    const [key, ...valueParts] = line.split('=');
    if (key) env[key.trim()] = valueParts.join('=').trim();
}

const requiredVars = [
    'VITE_API_URL',
    'VITE_ENV'
];

let allValid = true;

for (const varName of requiredVars) {
    if (!env[varName]) {
        console.log(`  ❌ Missing: ${varName}`);
        allValid = false;
    } else {
        console.log(`  ✅ ${varName}: ${env[varName]}`);
    }
}

// Custom validation checks
if (env.VITE_API_URL && !env.VITE_API_URL.startsWith('http')) {
    console.log(`  ❌ VITE_API_URL should start with http:// or https://`);
    allValid = false;
}

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 Frontend Environment Valid!');
} else {
    console.log('❌ Issues found in environment config.');
    process.exit(1);
}
