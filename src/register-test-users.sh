#!/bin/bash

# Register Test Users Script
# Registers 10 therapists and 10 clients with the backend for testing

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
echo "👥 REGISTER TEST USERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API Base: $API_BASE"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: jq is not installed${NC}"
    echo "Install jq for better output formatting: brew install jq (macOS) or apt-get install jq (Linux)"
    echo ""
fi

# Counters
THERAPIST_SUCCESS=0
THERAPIST_FAIL=0
CLIENT_SUCCESS=0
CLIENT_FAIL=0

# Function to register a user
register_user() {
    local user_id=$1
    local email=$2
    local role=$3
    local first_name=$4
    local last_name=$5
    
    echo -n "Registering $role: $email (ID: $user_id)... "
    
    RESPONSE=$(curl -s -X POST "$API_BASE/auth/register-or-login" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"$user_id\",
        \"email\": \"$email\",
        \"role\": \"$role\",
        \"firstName\": \"$first_name\",
        \"lastName\": \"$last_name\"
      }")
    
    # Check if successful
    if command -v jq &> /dev/null; then
        if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Success${NC}"
            if [ "$role" == "therapist" ]; then
                ((THERAPIST_SUCCESS++))
            else
                ((CLIENT_SUCCESS++))
            fi
        else
            echo -e "${RED}❌ Failed${NC}"
            if [ "$role" == "therapist" ]; then
                ((THERAPIST_FAIL++))
            else
                ((CLIENT_FAIL++))
            fi
            echo "   Response: $RESPONSE"
        fi
    else
        # Without jq, just check if response contains "success"
        if echo "$RESPONSE" | grep -q "success"; then
            echo -e "${GREEN}✅ Success${NC}"
            if [ "$role" == "therapist" ]; then
                ((THERAPIST_SUCCESS++))
            else
                ((CLIENT_SUCCESS++))
            fi
        else
            echo -e "${RED}❌ Failed${NC}"
            if [ "$role" == "therapist" ]; then
                ((THERAPIST_FAIL++))
            else
                ((CLIENT_FAIL++))
            fi
            echo "   Response: $RESPONSE"
        fi
    fi
}

# Register Therapists
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🩺 REGISTERING THERAPISTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

register_user "USR-THERAPIST-001" "therapist001@example.com" "therapist" "Emily" "Johnson"
register_user "USR-THERAPIST-002" "therapist002@example.com" "therapist" "Michael" "Brown"
register_user "USR-THERAPIST-003" "therapist003@example.com" "therapist" "Sophia" "Davis"
register_user "USR-THERAPIST-004" "therapist004@example.com" "therapist" "David" "Wilson"
register_user "USR-THERAPIST-005" "therapist005@example.com" "therapist" "Olivia" "Martinez"
register_user "USR-THERAPIST-006" "therapist006@example.com" "therapist" "William" "Garcia"
register_user "USR-THERAPIST-007" "therapist007@example.com" "therapist" "Emma" "Rodriguez"
register_user "USR-THERAPIST-008" "therapist008@example.com" "therapist" "Alexander" "Lee"
register_user "USR-THERAPIST-009" "therapist009@example.com" "therapist" "Isabella" "White"
register_user "USR-THERAPIST-010" "therapist010@example.com" "therapist" "Daniel" "Harris"

echo ""

# Register Clients
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}👤 REGISTERING CLIENTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

register_user "USR-CLIENT-001" "client001@example.com" "client" "Alice" "Thompson"
register_user "USR-CLIENT-002" "client002@example.com" "client" "Robert" "Anderson"
register_user "USR-CLIENT-003" "client003@example.com" "client" "Patricia" "Taylor"
register_user "USR-CLIENT-004" "client004@example.com" "client" "Christopher" "Moore"
register_user "USR-CLIENT-005" "client005@example.com" "client" "Jennifer" "Jackson"
register_user "USR-CLIENT-006" "client006@example.com" "client" "Matthew" "Martin"
register_user "USR-CLIENT-007" "client007@example.com" "client" "Linda" "Thompson"
register_user "USR-CLIENT-008" "client008@example.com" "client" "James" "Garcia"
register_user "USR-CLIENT-009" "client009@example.com" "client" "Barbara" "Martinez"
register_user "USR-CLIENT-010" "client010@example.com" "client" "Richard" "Robinson"

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}📊 REGISTRATION SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Therapists:"
echo -e "  ${GREEN}✅ Success: $THERAPIST_SUCCESS${NC}"
echo -e "  ${RED}❌ Failed:  $THERAPIST_FAIL${NC}"
echo ""
echo "Clients:"
echo -e "  ${GREEN}✅ Success: $CLIENT_SUCCESS${NC}"
echo -e "  ${RED}❌ Failed:  $CLIENT_FAIL${NC}"
echo ""

TOTAL_SUCCESS=$((THERAPIST_SUCCESS + CLIENT_SUCCESS))
TOTAL_FAIL=$((THERAPIST_FAIL + CLIENT_FAIL))
TOTAL=$((TOTAL_SUCCESS + TOTAL_FAIL))

echo "Total:"
echo -e "  ${GREEN}✅ Success: $TOTAL_SUCCESS / $TOTAL${NC}"
if [ $TOTAL_FAIL -gt 0 ]; then
    echo -e "  ${RED}❌ Failed:  $TOTAL_FAIL / $TOTAL${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TOTAL_SUCCESS -eq $TOTAL ]; then
    echo -e "${GREEN}🎉 All users registered successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Some users failed to register. Check the output above.${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
