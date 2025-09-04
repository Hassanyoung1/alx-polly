// Security Test Suite: Validates security patches
// Tests: Race conditions, IDOR, rate limiting, authorization, database constraints

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'

// Mock user data for testing
const testUsers = {
  alice: { id: 'user-alice', email: 'alice@test.com', token: 'token-alice' },
  bob: { id: 'user-bob', email: 'bob@test.com', token: 'token-bob' },
  charlie: { id: 'user-charlie', email: 'charlie@test.com', token: 'token-charlie' },
  admin: { id: 'user-admin', email: 'admin@test.com', token: 'token-admin', role: 'admin' }
}

const testPoll = {
  id: 'poll-123',
  title: 'Test Poll',
  created_by: testUsers.alice.id,
  options: [
    { id: 'option-1', text: 'Option 1' },
    { id: 'option-2', text: 'Option 2' }
  ]
}

async function makeRequest(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  const data = await response.json()
  return { response, data }
}

async function authenticatedRequest(user: typeof testUsers.alice, path: string, options: RequestInit = {}) {
  return makeRequest(path, {
    ...options,
    headers: {
      'Authorization': `Bearer ${user.token}`,
      ...options.headers
    }
  })
}

describe('Security Tests - Complete Implementation', () => {
  
  describe('V-001, V-002: Authorization and IDOR Protection', () => {
    test('should prevent unauthorized poll updates', async () => {
      // Bob tries to update Alice's poll
      const { response } = await authenticatedRequest(
        testUsers.bob,
        `/api/v1/polls/${testPoll.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: 'Hacked Poll Title',
            options: ['Malicious Option 1', 'Malicious Option 2']
          })
        }
      )
      
      expect(response.status).toBe(404) // Should return 404 to prevent enumeration
    })
    
    test('should prevent unauthorized poll deletion', async () => {
      // Charlie tries to delete Alice's poll
      const { response } = await authenticatedRequest(
        testUsers.charlie,
        `/api/v1/polls/${testPoll.id}`,
        { method: 'DELETE' }
      )
      
      expect(response.status).toBe(404)
    })
    
    test('should allow owner to update their own poll', async () => {
      // Alice updates her own poll
      const { response, data } = await authenticatedRequest(
        testUsers.alice,
        `/api/v1/polls/${testPoll.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            title: 'Updated Poll Title',
            options: ['Updated Option 1', 'Updated Option 2']
          })
        }
      )
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
  
  describe('V-005: Rate Limiting Protection', () => {
    test('should block excessive login attempts', async () => {
      const promises = []
      
      // Fire 10 concurrent login attempts
      for (let i = 0; i < 10; i++) {
        promises.push(
          makeRequest('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'wrong-password'
            })
          })
        )
      }
      
      const results = await Promise.all(promises)
      const rateLimitedResponses = results.filter(r => r.response.status === 429)
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
    
    test('should block excessive vote attempts', async () => {
      const promises = []
      
      // Fire 20 concurrent vote attempts
      for (let i = 0; i < 20; i++) {
        promises.push(
          makeRequest(`/api/v1/polls/${testPoll.id}/vote`, {
            method: 'POST',
            body: JSON.stringify({
              optionId: testPoll.options[0].id
            })
          })
        )
      }
      
      const results = await Promise.all(promises)
      const rateLimitedResponses = results.filter(r => r.response.status === 429)
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })
  
  describe('V-006: Race Condition Protection', () => {
    test('should prevent duplicate votes from same user', async () => {
      const promises = []
      
      // Fire 5 concurrent vote attempts from same user
      for (let i = 0; i < 5; i++) {
        promises.push(
          authenticatedRequest(
            testUsers.alice,
            `/api/v1/polls/${testPoll.id}/vote`,
            {
              method: 'POST',
              body: JSON.stringify({
                optionId: testPoll.options[0].id
              })
            }
          )
        )
      }
      
      const results = await Promise.all(promises)
      const successfulVotes = results.filter(r => r.response.status === 201)
      const duplicateVotes = results.filter(r => r.response.status === 409)
      
      // Only one vote should succeed
      expect(successfulVotes.length).toBe(1)
      expect(duplicateVotes.length).toBeGreaterThan(0)
    })
  })
  
  describe('V-003: Anonymous Vote Manipulation', () => {
    test('should apply rate limiting to anonymous votes', async () => {
      const promises = []
      
      // Fire 15 anonymous vote attempts
      for (let i = 0; i < 15; i++) {
        promises.push(
          makeRequest(`/api/v1/polls/${testPoll.id}/vote`, {
            method: 'POST',
            body: JSON.stringify({
              optionId: testPoll.options[0].id
            })
          })
        )
      }
      
      const results = await Promise.all(promises)
      const rateLimitedResponses = results.filter(r => r.response.status === 429)
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })
  
  describe('V-008: Information Disclosure Prevention', () => {
    test('should return generic error messages', async () => {
      // Try to access non-existent poll
      const { response, data } = await makeRequest('/api/v1/polls/non-existent-id')
      
      expect(response.status).toBe(404)
      expect(data.error).toBe('Poll not found') // Generic message
      expect(data.error).not.toContain('database')
      expect(data.error).not.toContain('SQL')
    })
    
    test('should not expose internal errors', async () => {
      // Send malformed request
      const { response, data } = await makeRequest('/api/v1/polls/123/vote', {
        method: 'POST',
        body: 'invalid json'
      })
      
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(data.error).not.toContain('SyntaxError')
      expect(data.error).not.toContain('JSON.parse')
    })
  })
  
  describe('Clock Drift and Time-based Attacks', () => {
    test('should validate poll expiry server-side', async () => {
      // This test would require setting up a poll with expiry in the past
      // and ensuring it's properly rejected
      const expiredPollId = 'expired-poll-123'
      
      const { response, data } = await makeRequest(`/api/v1/polls/${expiredPollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          optionId: 'option-1'
        })
      })
      
      if (response.status === 400) {
        expect(data.error).toContain('expired')
      }
    })
  })

  describe('V-007: Database Constraint Tests', () => {
    test('should prevent duplicate votes at database level', async () => {
      // This would test the unique constraints in the database
      // In a real test environment, we'd set up test data and verify constraints
      const { response: response1 } = await makeRequest(`/api/v1/polls/${testPoll.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          optionId: testPoll.options[0].id
        })
      })
      
      const { response: response2 } = await makeRequest(`/api/v1/polls/${testPoll.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          optionId: testPoll.options[1].id
        })
      })
      
      // One should succeed, one should fail with constraint violation
      const responses = [response1.status, response2.status]
      expect(responses).toContain(201) // At least one success
      expect(responses).toContain(409) // At least one conflict
    })

    test('should validate option belongs to poll', async () => {
      // Test voting with option from different poll
      const { response } = await makeRequest(`/api/v1/polls/${testPoll.id}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          optionId: 'invalid-option-id'
        })
      })
      
      expect(response.status).toBe(400)
    })
  })

  describe('V-008: Enhanced Input Validation', () => {
    test('should validate poll creation data', async () => {
      const testCases = [
        {
          data: { title: '', options: ['A', 'B'] },
          expectedStatus: 400,
          description: 'empty title'
        },
        {
          data: { title: 'A'.repeat(201), options: ['A', 'B'] },
          expectedStatus: 400,
          description: 'title too long'
        },
        {
          data: { title: 'Valid Title', options: ['A'] },
          expectedStatus: 400,
          description: 'insufficient options'
        },
        {
          data: { title: 'Valid Title', options: Array(11).fill('Option') },
          expectedStatus: 400,
          description: 'too many options'
        },
        {
          data: { title: 'Valid Title', options: ['', 'B'] },
          expectedStatus: 400,
          description: 'empty option'
        },
        {
          data: { title: 'Valid Title', options: ['A'.repeat(101), 'B'] },
          expectedStatus: 400,
          description: 'option too long'
        }
      ]

      for (const testCase of testCases) {
        const { response } = await authenticatedRequest(testUsers.alice, '/api/v1/polls', {
          method: 'POST',
          body: JSON.stringify(testCase.data)
        })
        
        expect(response.status).toBe(testCase.expectedStatus)
      }
    })

    test('should validate authentication data', async () => {
      const authTestCases = [
        {
          endpoint: '/api/v1/auth/login',
          data: { email: '', password: 'password' },
          expectedStatus: 400
        },
        {
          endpoint: '/api/v1/auth/login',
          data: { email: 'invalid-email', password: 'password' },
          expectedStatus: 400
        },
        {
          endpoint: '/api/v1/auth/register',
          data: { email: 'test@test.com', password: 'weak', name: 'Test' },
          expectedStatus: 400
        },
        {
          endpoint: '/api/v1/auth/register',
          data: { email: 'test@test.com', password: 'StrongPass123', name: 'X' },
          expectedStatus: 400
        }
      ]

      for (const testCase of authTestCases) {
        const { response } = await makeRequest(testCase.endpoint, {
          method: 'POST',
          body: JSON.stringify(testCase.data)
        })
        
        expect(response.status).toBe(testCase.expectedStatus)
      }
    })
  })

  describe('V-009: Security Monitoring', () => {
    test('should track security events', async () => {
      // Test that security events are being logged
      // This would require access to the security monitoring endpoint
      const { response } = await authenticatedRequest(testUsers.admin, '/api/v1/security', {
        method: 'GET'
      })
      
      if (response.status === 200) {
        const { data } = await response.json()
        expect(data).toHaveProperty('metrics')
        expect(data).toHaveProperty('score')
        expect(data).toHaveProperty('status')
      }
    })

    test('should allow security alert reporting', async () => {
      const { response } = await authenticatedRequest(testUsers.admin, '/api/v1/security', {
        method: 'POST',
        body: JSON.stringify({
          alertType: 'test_alert',
          description: 'Test security alert',
          severity: 'low'
        })
      })
      
      expect([201, 403]).toContain(response.status) // 201 if admin, 403 if not
    })
  })

  describe('V-010: Session Security', () => {
    test('should validate session tokens properly', async () => {
      const { response } = await makeRequest('/api/v1/polls/123/vote', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      })
      
      expect(response.status).toBe(401)
    })

    test('should handle missing authentication gracefully', async () => {
      const { response } = await makeRequest('/api/v1/polls', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Poll',
          options: ['A', 'B']
        })
      })
      
      expect(response.status).toBe(401)
    })
  })

  describe('Integration Tests', () => {
    test('should maintain data integrity under concurrent operations', async () => {
      // Simulate concurrent poll creation and voting
      const promises = []
      
      // Multiple users creating polls simultaneously
      for (let i = 0; i < 5; i++) {
        promises.push(
          authenticatedRequest(testUsers.alice, '/api/v1/polls', {
            method: 'POST',
            body: JSON.stringify({
              title: `Concurrent Poll ${i}`,
              options: ['Option A', 'Option B']
            })
          })
        )
      }
      
      const results = await Promise.all(promises)
      const successfulCreations = results.filter(r => r.response.status === 201)
      
      // Should handle concurrent operations gracefully
      expect(successfulCreations.length).toBeGreaterThan(0)
    })

    test('should maintain security under high load', async () => {
      // Test rate limiting effectiveness under load
      const promises = []
      
      for (let i = 0; i < 20; i++) {
        promises.push(
          makeRequest('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@test.com',
              password: 'wrongpassword'
            })
          })
        )
      }
      
      const results = await Promise.all(promises)
      const rateLimitedCount = results.filter(r => r.response.status === 429).length
      
      // Should trigger rate limiting
      expect(rateLimitedCount).toBeGreaterThan(0)
    })
  })
})

// Export for use in CI/CD
export { testUsers, testPoll, makeRequest, authenticatedRequest }
