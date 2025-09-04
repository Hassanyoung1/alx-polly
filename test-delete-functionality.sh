#!/bin/bash

echo "🧪 Testing ALX Polly Delete Button Functionality"
echo "================================================"

# Test 1: Check if the server is running
echo "📡 Test 1: Checking server status..."
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/polls")
if [ "$SERVER_STATUS" = "200" ]; then
    echo "✅ Server is running (Status: $SERVER_STATUS)"
else
    echo "❌ Server is not responding properly (Status: $SERVER_STATUS)"
    exit 1
fi

# Test 2: Check API endpoint availability
echo ""
echo "📡 Test 2: Checking polls API..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/v1/polls")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ Polls API is working (Status: $API_STATUS)"
else
    echo "❌ Polls API error (Status: $API_STATUS)"
fi

# Test 3: Get list of polls to test delete
echo ""
echo "📡 Test 3: Fetching polls for delete test..."
POLLS_RESPONSE=$(curl -s "http://localhost:3000/api/v1/polls")
echo "📊 Polls data: $POLLS_RESPONSE"

# Test 4: Check if polls have proper structure for delete buttons
echo ""
echo "📡 Test 4: Checking poll structure..."
if echo "$POLLS_RESPONSE" | grep -q '"id"'; then
    echo "✅ Polls have ID field for delete operations"
else
    echo "❌ Polls missing ID field"
fi

# Test 5: Test delete endpoint directly (using a fake ID to check error handling)
echo ""
echo "📡 Test 5: Testing delete endpoint..."
DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:3000/api/v1/polls/test-fake-id")
echo "🗑️ Delete response: $DELETE_RESPONSE"

echo ""
echo "🎯 Delete Button Debugging Guide:"
echo "1. Open browser at http://localhost:3000/polls"
echo "2. Look for 🗑️ (basket/trash) icon on poll cards"
echo "3. Click the 🗑️ button (NOT the poll card itself)"
echo "4. Check browser console for any JavaScript errors"
echo "5. Verify that a confirmation dialog appears"
echo ""
echo "💡 Troubleshooting Tips:"
echo "- Make sure to click the 🗑️ button directly"
echo "- Check browser dev tools console for errors"
echo "- The delete button should have a red color on hover"
echo "- A confirmation dialog should appear before deletion"
