#!/bin/bash

# Simple Backend Connection Test
# Tests if your backend is reachable and CORS is properly configured

set -e

API_BASE_URL="https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api"
HEALTH_URL="https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "🔍 Backend Connection Test"
echo "=========================================="
echo ""
echo -e "${BLUE}Backend URL:${NC} $API_BASE_URL"
echo ""

# Test 1: Health Check
echo -e "${CYAN}Test 1: Health Endpoint${NC}"
echo "=========================================="
echo "Testing: GET $HEALTH_URL/health"
echo ""

RESPONSE=$(curl -s -w "\\n%{http_code}" -X GET \
  "$HEALTH_URL/health" \
  -H "Accept: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq "200" ]; then
    echo -e "${GREEN}✅ PASS: Health endpoint is reachable${NC}"
    echo -e "${BLUE}Status Code:${NC} $HTTP_CODE"
    echo -e "${BLUE}Response:${NC} $BODY"
else
    echo -e "${RED}❌ FAIL: Health endpoint returned $HTTP_CODE${NC}"
    echo -e "${BLUE}Response:${NC} $BODY"
fi
echo ""

# Test 2: Login Endpoint (without credentials)
echo -e "${CYAN}Test 2: Login Endpoint${NC}"
echo "=========================================="
echo "Testing: POST $API_BASE_URL/auth/register-or-login"
echo "(Sending minimal request - expect 200 or 400)"
echo ""

RESPONSE=$(curl -s -w "\\n%{http_code}" -X POST \
  "$API_BASE_URL/auth/register-or-login" \
  -H "Content-Type: application/json" \
  -d '{"userId":"TEST-001","email":"test@example.com","role":"therapist"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq "200" ]; then
    echo -e "${GREEN}✅ PASS: Login endpoint is reachable and working!${NC}"
    echo -e "${BLUE}Status Code:${NC} $HTTP_CODE"
    echo -e "${BLUE}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
elif [ "$HTTP_CODE" -eq "400" ] || [ "$HTTP_CODE" -eq "401" ]; then
    echo -e "${GREEN}✅ PASS: Login endpoint is reachable (returned expected error)${NC}"
    echo -e "${BLUE}Status Code:${NC} $HTTP_CODE"
    echo -e "${BLUE}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ FAIL: Login endpoint returned unexpected status $HTTP_CODE${NC}"
    echo -e "${BLUE}Response:${NC} $BODY"
fi
echo ""

# Test 3: Actual Login with Demo Credentials
echo -e "${CYAN}Test 3: Real Login Test${NC}"
echo "=========================================="
echo "Testing login with: therapist3@bedrock.test"
echo ""

RESPONSE=$(curl -s -w "\\n%{http_code}" -X POST \
  "$API_BASE_URL/auth/register-or-login" \
  -H "Content-Type: application/json" \
  -d '{"userId":"therapist-3-id","email":"therapist3@bedrock.test","role":"therapist"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq "200" ]; then
    echo -e "${GREEN}✅ PASS: Login successful!${NC}"
    echo -e "${BLUE}Status Code:${NC} $HTTP_CODE"
    echo ""
    echo -e "${BLUE}User Info:${NC}"
    echo "$BODY" | jq '.data.user // .user' 2>/dev/null || echo "Could not parse user"
    echo ""
    
    # Extract token
    TOKEN=$(echo "$BODY" | jq -r '.data.tokens.accessToken // .tokens.accessToken' 2>/dev/null)
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Access token received${NC}"
        echo -e "${BLUE}Token (first 50 chars):${NC} ${TOKEN:0:50}..."
    else
        echo -e "${YELLOW}⚠️  No access token in response${NC}"
    fi
else
    echo -e "${RED}❌ FAIL: Login failed with status $HTTP_CODE${NC}"
    echo -e "${BLUE}Response:${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
fi
echo ""

# Test 4: CORS Headers Check
echo -e "${CYAN}Test 4: CORS Headers${NC}"
echo "=========================================="
echo "Checking CORS configuration..."
echo ""

CORS_RESPONSE=$(curl -s -I -X OPTIONS \
  "$HEALTH_URL/health" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET")

echo "$CORS_RESPONSE" | grep -i "access-control" && \
  echo -e "${GREEN}✅ CORS headers present${NC}" || \
  echo -e "${YELLOW}⚠️  No CORS headers found${NC}"
echo ""

# Summary
echo "=========================================="
echo -e "${CYAN}📊 Summary${NC}"
echo "=========================================="
echo ""

if [ "$HTTP_CODE" -eq "200" ]; then
    echo -e "${GREEN}✅ Backend is FULLY OPERATIONAL${NC}"
    echo ""
    echo "Your backend at:"
    echo "  $API_BASE_URL"
    echo ""
    echo "is working correctly and ready to use!"
    echo ""
    echo "Next steps:"
    echo "  1. Run your frontend: npm run dev"
    echo "  2. Login with: therapist3@bedrock.test"
    echo "  3. Start using the calendar!"
else
    echo -e "${RED}❌ BACKEND ISSUES DETECTED${NC}"
    echo ""
    echo "Possible issues:"
    echo "  1. Backend not deployed"
    echo "  2. Wrong URL or endpoint"
    echo "  3. CORS not configured for localhost:5173"
    echo "  4. Firebase function offline"
    echo ""
    echo "To fix:"
    echo "  1. Deploy backend: firebase deploy --only functions:bedrockBackendApi"
    echo "  2. Check Firebase console for errors"
    echo "  3. Verify URL is correct"
fi
echo ""
