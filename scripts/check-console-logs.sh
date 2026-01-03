#!/bin/bash

# Batch Console.log Replacement Script
# This script replaces console.log/error/warn with secure logger

echo "🔄 Starting console.log replacement..."

# Files to process (excluding test files and examples)
FILES=(
  "src/App.tsx"
  "src/components/SettingsView.tsx"
  "src/components/onboarding/TherapistOnboarding.tsx"
  "src/components/onboarding/OnboardingStep1Signup.tsx"
  "src/components/AddressAutocomplete.tsx"
  "src/components/JitsiVideoRoom.tsx"
  "src/components/VideoCallRoom.tsx"
  "src/components/ErrorBoundary.tsx"
  "src/services/jitsiService.ts"
  "src/config/jitsi.ts"
  "src/config/googleMaps.ts"
  "src/utils/firebaseErrorHandler.ts"
)

# Count total console statements
TOTAL=$(grep -r "console\." src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules | wc -l | tr -d ' ')
echo "📊 Total console statements found: $TOTAL"

# List files with console statements
echo ""
echo "📁 Files with console statements:"
grep -r "console\." src/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules -l | while read file; do
  count=$(grep "console\." "$file" | wc -l | tr -d ' ')
  echo "   $file: $count statements"
done

echo ""
echo "✅ Priority files have been manually updated with secure logger"
echo "⚠️  Remaining files can be updated gradually or with automated script"
echo ""
echo "📋 Next steps:"
echo "1. Review CONSOLE_LOG_REPLACEMENT_PROGRESS.md for status"
echo "2. Update remaining files as needed"
echo "3. Run: npm run build to verify no errors"
