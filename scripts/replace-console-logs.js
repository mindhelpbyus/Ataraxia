#!/usr/bin/env node

/**
 * Automated Console.log Replacement Tool
 * 
 * This script safely replaces console.log/error/warn/info with secure logger
 * while preserving context and adding proper imports.
 */

const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'src/App.tsx',
    'src/components/SettingsView.tsx',
    'src/components/onboarding/TherapistOnboarding.tsx',
    'src/components/onboarding/OnboardingStep1Signup.tsx',
    'src/components/AddressAutocomplete.tsx',
    'src/components/JitsiVideoRoom.tsx',
    'src/components/VideoCallRoom.tsx',
    'src/components/ErrorBoundary.tsx',
    'src/config/jitsi.ts',
    'src/config/googleMaps.ts',
    'src/utils/firebaseErrorHandler.ts',
];

function hasLoggerImport(content) {
    return content.includes("from './services/secureLogger'") ||
        content.includes("from '../services/secureLogger'") ||
        content.includes("from '../../services/secureLogger'");
}

function getRelativeImportPath(filePath) {
    const depth = filePath.split('/').length - 2; // -2 for 'src' and filename
    return '../'.repeat(depth) + 'services/secureLogger';
}

function addLoggerImport(content, filePath) {
    if (hasLoggerImport(content)) {
        return content;
    }

    const importPath = getRelativeImportPath(filePath);
    const loggerImport = `import { logger } from '${importPath}';\n`;

    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
            lastImportIndex = i;
        }
    }

    if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, loggerImport);
        return lines.join('\n');
    }

    // If no imports found, add at the beginning
    return loggerImport + content;
}

function replaceConsoleLogs(content) {
    // Replace console.log with logger.info
    content = content.replace(/console\.log\(/g, 'logger.info(');

    // Replace console.error with logger.error
    content = content.replace(/console\.error\(/g, 'logger.error(');

    // Replace console.warn with logger.warn
    content = content.replace(/console\.warn\(/g, 'logger.warn(');

    // Replace console.info with logger.info
    content = content.replace(/console\.info\(/g, 'logger.info(');

    // Replace console.debug with logger.debug
    content = content.replace(/console\.debug\(/g, 'logger.debug(');

    return content;
}

function processFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Check if file has console statements
    if (!content.includes('console.')) {
        console.log(`✅ ${filePath} - No console statements found`);
        return false;
    }

    // Add logger import if needed
    content = addLoggerImport(content, filePath);

    // Replace console statements
    content = replaceConsoleLogs(content);

    // Only write if content changed
    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        const count = (originalContent.match(/console\./g) || []).length;
        console.log(`✅ ${filePath} - Replaced ${count} console statements`);
        return true;
    }

    return false;
}

function main() {
    console.log('🔄 Starting automated console.log replacement...\n');

    let processedCount = 0;
    let totalReplaced = 0;

    for (const file of filesToProcess) {
        if (processFile(file)) {
            processedCount++;
        }
    }

    console.log(`\n✅ Processed ${processedCount} files`);
    console.log('📋 Run "npm run build" to verify changes');
    console.log('⚠️  Review changes before committing');
}

if (require.main === module) {
    main();
}

module.exports = { processFile, replaceConsoleLogs, addLoggerImport };
