#!/bin/bash

# Auth API Integration Test Script
BASE_URL="http://localhost:3000"

echo "=== WHATtodo Auth API Tests ==="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
curl -X GET "${BASE_URL}/health" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 2: Signup - Valid Request
echo "Test 2: Signup - Valid Request"
curl -X POST "${BASE_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nickname": "testuser"
  }'
echo ""
echo ""

# Test 3: Signup - Missing Fields
echo "Test 3: Signup - Missing Fields"
curl -X POST "${BASE_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com"
  }'
echo ""
echo ""

# Test 4: Login - Valid Request
echo "Test 4: Login - Valid Request"
curl -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
echo ""
echo ""

# Test 5: Login - Missing Password
echo "Test 5: Login - Missing Password"
curl -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
echo ""
echo ""

# Test 6: Refresh - Valid Token (replace with actual token)
echo "Test 6: Refresh - Missing Token"
curl -X POST "${BASE_URL}/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{}'
echo ""
echo ""

# Test 7: Logout
echo "Test 7: Logout"
curl -X POST "${BASE_URL}/api/auth/logout" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 8: Invalid Method
echo "Test 8: Invalid Method - GET on POST endpoint"
curl -X GET "${BASE_URL}/api/auth/signup" \
  -H "Content-Type: application/json"
echo ""
echo ""

echo "=== Tests Complete ==="
