#!/bin/bash

# Firebase Rules Deployment Script
# Deploys Firestore security rules and indexes

echo "🔥 Firebase Rules Deployment Script"
echo "===================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "📦 Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase"
    echo "🔐 Run: firebase login"
    exit 1
fi

echo "✅ Logged into Firebase"
echo ""

# Show current project
echo "📋 Current Firebase project:"
firebase use

echo ""
echo "🚀 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

echo ""
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully!"
else
    echo "⚠️  Firestore indexes deployment had issues"
    echo "💡 You may need to create indexes manually via Firebase Console"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Clear your browser cache (Ctrl+Shift+Delete)"
echo "2. Refresh your application"
echo "3. Test chat functionality"
echo "4. Check Firebase Console for any index creation status"
echo ""
echo "🔍 Monitor at: https://console.firebase.google.com/project/ataraxia-c150f/firestore"
