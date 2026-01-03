#!/bin/bash

# Complete Appointment Testing Script
# Tests: Create, Get, Update, Cancel appointments

set -e

API_BASE_URL="https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api"
THERAPIST_EMAIL="therapist3@bedrock.test"
THERAPIST_PASSWORD="Therapist123!"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "=========================================="
echo "🗓️  Complete Appointment Testing"
echo "=========================================="
echo ""

# Function to print results
print_result() {
    local test_name="$1"
    local status_code="$2"
    local expected_code="$3"
    
    if [ "$status_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name (Status: $status_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name (Expected: $expected_code, Got: $status_code)"
        return 1
    fi
}

# Step 1: Login as Therapist
echo -e "${CYAN}Step 1: Login as Therapist${NC}"
echo "=========================================="

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$THERAPIST_EMAIL\",\"password\":\"$THERAPIST_PASSWORD\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

print_result "Therapist Login" "$HTTP_CODE" "200"

THERAPIST_TOKEN=$(echo "$BODY" | jq -r '.data.tokens.accessToken' 2>/dev/null)
THERAPIST_ID=$(echo "$BODY" | jq -r '.data.user.id' 2>/dev/null)

echo -e "${BLUE}Therapist ID:${NC} $THERAPIST_ID"
echo ""

# Step 2: Create a test client user
echo -e "${CYAN}Step 2: Create Test Client${NC}"
echo "=========================================="

CLIENT_EMAIL="test-client-$(date +%s)@bedrock.test"
CLIENT_PASSWORD="Client123!"

# Use test-login to create a client
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_BASE_URL/auth/test-login" \
  -H "Content-Type: application/json" \
  -d "{\"role\":\"client\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq "200" ]; then
    CLIENT_ID=$(echo "$BODY" | jq -r '.data.user.id' 2>/dev/null)
    echo -e "${GREEN}✅ Test client created${NC}"
    echo -e "${BLUE}Client ID:${NC} $CLIENT_ID"
else
    echo -e "${YELLOW}⚠️  Using fallback client ID${NC}"
    CLIENT_ID="test-client-fallback"
fi
echo ""

# Step 3: Create Future Appointment
echo -e "${CYAN}Step 3: Create Future Appointment${NC}"
echo "=========================================="

# Calculate times (2 days from now)
if [[ "$OSTYPE" == "darwin"* ]]; then
    START_TIME=$(date -u -v+2d -v+10H +"%Y-%m-%dT%H:00:00Z")
    END_TIME=$(date -u -v+2d -v+11H +"%Y-%m-%dT%H:00:00Z")
else
    START_TIME=$(date -u -d "+2 days +10 hours" +"%Y-%m-%dT%H:00:00Z")
    END_TIME=$(date -u -d "+2 days +11 hours" +"%Y-%m-%dT%H:00:00Z")
fi

echo "Start Time: $START_TIME"
echo "End Time: $END_TIME"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_BASE_URL/appointments" \
  -H "Authorization: Bearer $THERAPIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"therapistId\": \"$THERAPIST_ID\",
    \"clientId\": \"$CLIENT_ID\",
    \"title\": \"Test Therapy Session\",
    \"description\": \"Complete testing of appointment flow\",
    \"startTime\": \"$START_TIME\",
    \"endTime\": \"$END_TIME\",
    \"type\": \"video\",
    \"notes\": \"Test appointment - Complete testing\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -eq "201" ] || [ "$HTTP_CODE" -eq "200" ]; then
    print_result "Create Appointment" "$HTTP_CODE" "201"
    
    # Backend wraps response in { data: {...} }
    APPOINTMENT_ID=$(echo "$BODY" | jq -r '.data.id // .id' 2>/dev/null)
    APPOINTMENT_STATUS=$(echo "$BODY" | jq -r '.data.status // .status' 2>/dev/null)
    SESSION_ID=$(echo "$BODY" | jq -r '.data.sessionId // .sessionId' 2>/dev/null)
    MEETING_LINK=$(echo "$BODY" | jq -r '.data.joinLink // .joinLink' 2>/dev/null)
    
    echo -e "${BLUE}Appointment ID:${NC} $APPOINTMENT_ID"
    echo -e "${BLUE}Status:${NC} $APPOINTMENT_STATUS"
    echo -e "${BLUE}Session ID:${NC} $SESSION_ID"
    echo -e "${BLUE}Join Link:${NC} $MEETING_LINK"
    echo ""
    
    # Step 4: Get Appointment Details
    echo -e "${CYAN}Step 4: Get Appointment Details${NC}"
    echo "=========================================="
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
      "$API_BASE_URL/appointments/$APPOINTMENT_ID" \
      -H "Authorization: Bearer $THERAPIST_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    print_result "Get Appointment Details" "$HTTP_CODE" "200"
    echo ""
    
    # Step 5: Get Therapist's Appointments
    echo -e "${CYAN}Step 5: Get Therapist's Appointments${NC}"
    echo "=========================================="
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
      "$API_BASE_URL/appointments/therapist/$THERAPIST_ID?status=scheduled" \
      -H "Authorization: Bearer $THERAPIST_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    print_result "Get Therapist Appointments" "$HTTP_CODE" "200"
    
    # Count appointments from array (backend returns array directly or wrapped in data)
    TOTAL_APPOINTMENTS=$(echo "$BODY" | jq -r 'if .data then (.data | length) else length end' 2>/dev/null)
    echo -e "${BLUE}Total Appointments:${NC} $TOTAL_APPOINTMENTS"
    echo ""
    
    # Step 6: Get Appointment Join Link
    echo -e "${CYAN}Step 6: Get Appointment Join Link${NC}"
    echo "=========================================="
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
      "$API_BASE_URL/appointments/$APPOINTMENT_ID/join-link" \
      -H "Authorization: Bearer $THERAPIST_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    print_result "Get Join Link" "$HTTP_CODE" "200"
    
    # Extract JWT and session info (handle both wrapped and unwrapped responses)
    JITSI_JWT=$(echo "$BODY" | jq -r '.data.jwt // .jwt' 2>/dev/null)
    SESSION_ID=$(echo "$BODY" | jq -r '.data.sessionId // .sessionId' 2>/dev/null)
    JOIN_LINK=$(echo "$BODY" | jq -r '.data.joinLink // .joinLink' 2>/dev/null)
    
    if [ "$JITSI_JWT" != "null" ] && [ -n "$JITSI_JWT" ]; then
        echo -e "${GREEN}✅ Jitsi JWT Generated${NC}"
        echo -e "${BLUE}Session ID:${NC} $SESSION_ID"
        echo -e "${BLUE}Join Link:${NC} $JOIN_LINK"
        echo ""
        
        # Decode JWT (handle both macOS and Linux base64)
        echo -e "${YELLOW}JWT Payload:${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "$JITSI_JWT" | cut -d'.' -f2 | base64 -D 2>/dev/null | jq '.' || echo "Could not decode"
        else
            echo "$JITSI_JWT" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq '.' || echo "Could not decode"
        fi
        echo ""
    else
        echo -e "${YELLOW}⚠️  No JWT in response${NC}"
        echo ""
    fi
    
    # Step 7: Cancel Appointment
    echo -e "${CYAN}Step 7: Cancel Appointment${NC}"
    echo "=========================================="
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
      "$API_BASE_URL/appointments/$APPOINTMENT_ID" \
      -H "Authorization: Bearer $THERAPIST_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"reason": "Testing cancellation"}')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    print_result "Cancel Appointment" "$HTTP_CODE" "200"
    echo ""
    
else
    if [ "$HTTP_CODE" -eq "201" ] || [ "$HTTP_CODE" -eq "200" ]; then
        print_result "Create Appointment" "$HTTP_CODE" "201"
    else
        echo -e "${RED}❌ Appointment creation failed (Status: $HTTP_CODE)${NC}"
    fi
    echo ""
    echo -e "${RED}❌ Appointment creation failed. Skipping remaining tests.${NC}"
    echo ""
    echo "Error details:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
fi

# Summary
echo "=========================================="
echo -e "${CYAN}📊 Test Summary${NC}"
echo "=========================================="
echo ""
echo "API Base URL: $API_BASE_URL"
echo "Therapist: $THERAPIST_EMAIL"
echo "Therapist ID: $THERAPIST_ID"
echo ""
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
