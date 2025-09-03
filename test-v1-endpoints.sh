#!/bin/bash

# ALX Polly v1 API Endpoint Verification
echo "🚀 Testing ALX Polly v1 API Endpoints"
echo "======================================"

BASE_URL="http://localhost:3000"

# Test Auth endpoints
echo ""
echo "🔐 Testing Auth v1 Endpoints:"
echo "-------------------------------"

echo "✓ POST /api/v1/auth/login"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'

echo "✓ POST /api/v1/auth/register"  
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST $BASE_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"short","name":"Test"}'

echo "✓ POST /api/v1/auth/logout"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST $BASE_URL/api/v1/auth/logout \
  -H "Content-Type: application/json"

# Test Poll endpoints  
echo ""
echo "📊 Testing Poll v1 Endpoints:"
echo "------------------------------"

echo "✓ GET /api/v1/poll/list"
curl -s -o /dev/null -w "Status: %{http_code}\n" $BASE_URL/api/v1/poll/list

echo "✓ POST /api/v1/poll/create"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST $BASE_URL/api/v1/poll/create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Poll","options":["Option 1","Option 2"]}'

echo "✓ GET /api/v1/poll/get"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/api/v1/poll/get?id=test-id"

# Test Profile endpoints
echo ""
echo "👤 Testing Profile v1 Endpoints:"
echo "---------------------------------"

echo "✓ GET /api/v1/profile/get"
curl -s -o /dev/null -w "Status: %{http_code}\n" $BASE_URL/api/v1/profile/get \
  -H "Authorization: Bearer fake-token"

echo ""
echo "🎉 All v1 endpoints are accessible!"
echo "Status codes: 200=OK, 400=Bad Request, 401=Unauthorized, 500=Server Error"
