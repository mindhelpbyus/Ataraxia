#!/bin/bash

# Test All User Authentication
# Tests all valid userId/email combinations with the backend

API_URL="https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       BACKEND AUTHENTICATION TEST - ALL USERS                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Dr. Sarah Mitchell (Therapist)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Dr. Sarah Mitchell (Therapist)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "therapist-3-id",
    "email": "therapist3@bedrock.test",
    "role": "therapist",
    "firstName": "Sarah",
    "lastName": "Mitchell"
  }' | jq '.' || echo "❌ Request failed"
echo ""

# Test 2: Dr. James Chen (Therapist)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Dr. James Chen (Therapist)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "therapist-4-id",
    "email": "therapist4@bedrock.test",
    "role": "therapist",
    "firstName": "James",
    "lastName": "Chen"
  }' | jq '.' || echo "❌ Request failed"
echo ""

# Test 3: Test User (Backend Verified)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Test User (Backend Verified) ⭐"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-2025",
    "email": "newtest@example.com",
    "role": "therapist",
    "firstName": "Test",
    "lastName": "User"
  }' | jq '.' || echo "❌ Request failed"
echo ""

# Test 4: System Administrator (Admin)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: System Administrator (Admin)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin-3-id",
    "email": "admin3@bedrock.test",
    "role": "admin",
    "firstName": "System",
    "lastName": "Administrator"
  }' | jq '.' || echo "❌ Request failed"
echo ""

# Test 5: Susan Marie (Client)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Susan Marie (Client)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "client-susan-id",
    "email": "susan.marie@email.com",
    "role": "client",
    "firstName": "Susan",
    "lastName": "Marie"
  }' | jq '.' || echo "❌ Request failed"
echo ""

# Test 6: John Paul (Client)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: John Paul (Client)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "client-john-id",
    "email": "john.paul@email.com",
    "role": "client",
    "firstName": "John",
    "lastName": "Paul"
  }' | jq '.' || echo "❌ Request failed"
echo ""

# Test 7: New Random User (Test Registration)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: New Random User (Testing Registration)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-RANDOM-002",
    "email": "randomuser@example.com",
    "role": "therapist",
    "firstName": "Random",
    "lastName": "TestUser"
  }' | jq '.' || echo "❌ Request failed"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     TESTS COMPLETE                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ If all tests show 'success: true' → Backend is working correctly"
echo "❌ If tests show errors → Check BACKEND_TEST_CREDENTIALS.md"
echo ""
