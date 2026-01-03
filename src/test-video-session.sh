#!/bin/bash

# Video Session Creation Test Script
# Tests the complete flow: Login -> Create Session -> Get JWT Token

set -e  # Exit on error

API_BASE="https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎥 VIDEO SESSION CREATION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Base: $API_BASE"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is not installed${NC}"
    echo "Please install jq: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

# Step 1: Login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔐 STEP 1: LOGIN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Logging in as Test User (USR-THERAPIST-2025)..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register-or-login" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-2025",
    "email": "newtest@example.com",
    "role": "therapist",
    "firstName": "Test",
    "lastName": "User"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

# Check if login was successful
if echo "$LOGIN_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo ""
    echo -e "${GREEN}✅ Login successful!${NC}"
else
    echo ""
    echo -e "${RED}❌ Login failed!${NC}"
    echo "Response:"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# Extract token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.tokens.accessToken // .tokens.accessToken // .accessToken')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract access token${NC}"
    echo "Response:"
    echo "$LOGIN_RESPONSE" | jq '.'
    exit 1
fi

echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Step 2: Create Session
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🎬 STEP 2: CREATE VIDEO SESSION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Creating video session with correct format..."
echo ""

# Calculate timestamps
START_TIME=$(date -u -v+1H +"%Y-%m-%dT%H:00:00.000Z" 2>/dev/null || date -u -d '+1 hour' +"%Y-%m-%dT%H:00:00.000Z")
END_TIME=$(date -u -v+2H +"%Y-%m-%dT%H:00:00.000Z" 2>/dev/null || date -u -d '+2 hours' +"%Y-%m-%dT%H:00:00.000Z")

echo "Request Body:"
echo "{
  \"therapistId\": \"USR-THERAPIST-2025\",
  \"clientId\": \"USR-CLIENT-2025\",
  \"startTime\": \"$START_TIME\",
  \"endTime\": \"$END_TIME\",
  \"recordingEnabled\": false,
  \"chatEnabled\": true,
  \"screenShareEnabled\": true,
  \"notes\": \"Test video call session created via script\"
}" | jq '.'
echo ""

SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"therapistId\": \"USR-THERAPIST-2025\",
    \"clientId\": \"USR-CLIENT-2025\",
    \"startTime\": \"$START_TIME\",
    \"endTime\": \"$END_TIME\",
    \"recordingEnabled\": false,
    \"chatEnabled\": true,
    \"screenShareEnabled\": true,
    \"notes\": \"Test video call session created via script\"
  }")

echo "Response:"
echo "$SESSION_RESPONSE" | jq '.'

# Check if session creation was successful
if echo "$SESSION_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo ""
    echo -e "${GREEN}✅ Session created successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Session creation failed!${NC}"
    echo "Response:"
    echo "$SESSION_RESPONSE"
    exit 1
fi

# Extract sessionId
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.appointment.sessionId // .data.appointment.id // .data.id // .appointment.sessionId // .appointment.id // .sessionId // .id')

if [ "$SESSION_ID" == "null" ] || [ -z "$SESSION_ID" ]; then
    echo -e "${YELLOW}⚠️  Warning: Could not extract sessionId from response${NC}"
    echo "Trying alternative extraction methods..."
    SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data | to_entries | .[0].value.id')
fi

if [ "$SESSION_ID" == "null" ] || [ -z "$SESSION_ID" ]; then
    echo -e "${RED}❌ Failed to extract session ID${NC}"
    echo "Response structure:"
    echo "$SESSION_RESPONSE" | jq 'keys'
    exit 1
fi

echo "Session ID: $SESSION_ID"
echo ""

# Step 3: Get JWT Token
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔑 STEP 3: GET JWT TOKEN${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Getting JWT token for Jitsi video call..."
echo ""

JWT_RESPONSE=$(curl -s -X GET "$API_BASE/sessions/$SESSION_ID/jwt" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$JWT_RESPONSE" | jq '.'

# Check if JWT generation was successful
if echo "$JWT_RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo ""
    echo -e "${GREEN}✅ JWT token generated successfully!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  JWT generation response doesn't have success flag${NC}"
    echo "This might be okay if token is present in response"
fi

JWT_TOKEN=$(echo "$JWT_RESPONSE" | jq -r '.data.jitsiToken // .data.jwt // .jitsiToken // .jwt // .token')

if [ "$JWT_TOKEN" == "null" ] || [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract JWT token${NC}"
    echo "Response:"
    echo "$JWT_RESPONSE" | jq '.'
    exit 1
fi

echo "JWT Token: ${JWT_TOKEN:0:80}..."
echo ""

# Success Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 ALL STEPS COMPLETED SUCCESSFULLY!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  ✅ Logged in as: Test User (USR-THERAPIST-2025)"
echo "  ✅ Access Token: ${ACCESS_TOKEN:0:40}..."
echo "  ✅ Session ID: $SESSION_ID"
echo "  ✅ JWT Token: ${JWT_TOKEN:0:40}..."
echo ""
echo "🎥 Next Steps:"
echo "  1. Use the JWT token to join the Jitsi video call"
echo "  2. Use sessionId to manage the session"
echo "  3. Video call should be accessible at your Jitsi server"
echo ""
echo "📝 Session Details:"
echo "  • Start Time: $START_TIME"
echo "  • End Time: $END_TIME"
echo "  • Therapist: USR-THERAPIST-2025 (Test User)"
echo "  • Client: USR-CLIENT-2025 (Real Backend Client)"
echo "  • Recording: Disabled"
echo "  • Chat: Enabled"
echo "  • Screen Share: Enabled"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
