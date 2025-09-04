"use client"

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CSPViolation {
  blockedURI: string
  columnNumber: number
  documentURI: string
  effectiveDirective: string
  lineNumber: number
  originalPolicy: string
  referrer: string
  sourceFile: string
  violatedDirective: string
}

export function CSPMonitor() {
  const [violations, setViolations] = useState<CSPViolation[]>([])
  const [cspStatus, setCSPStatus] = useState<'checking' | 'enabled' | 'disabled'>('checking')

  useEffect(() => {
    // Check if CSP is enabled by looking for CSP headers
    const checkCSP = async () => {
      try {
        const response = await fetch(window.location.href, { method: 'HEAD' })
        const cspHeader = response.headers.get('content-security-policy')
        setCSPStatus(cspHeader ? 'enabled' : 'disabled')
      } catch {
        setCSPStatus('disabled')
      }
    }

    // Listen for CSP violations
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      const violation: CSPViolation = {
        blockedURI: event.blockedURI,
        columnNumber: event.columnNumber,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        lineNumber: event.lineNumber,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        sourceFile: event.sourceFile,
        violatedDirective: event.violatedDirective
      }
      
      setViolations(prev => [...prev, violation])
      console.warn('CSP Violation:', violation)
    }

    // Test basic JavaScript execution (should not be blocked)
    const testJSExecution = () => {
      try {
        // This should work with 'unsafe-eval' in CSP
        eval('1 + 1')
        console.log('✅ JavaScript eval() execution allowed')
      } catch (error) {
        console.error('❌ JavaScript eval() blocked by CSP:', error)
      }
    }

    checkCSP()
    testJSExecution()
    
    document.addEventListener('securitypolicyviolation', handleCSPViolation)
    
    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation)
    }
  }, [])

  const clearViolations = () => {
    setViolations([])
  }

  const testInlineScript = () => {
    try {
      // Create and execute inline script
      const script = document.createElement('script')
      script.textContent = 'console.log("✅ Inline script execution test passed")'
      document.head.appendChild(script)
      document.head.removeChild(script)
    } catch (error) {
      console.error('❌ Inline script blocked:', error)
    }
  }

  const testInlineStyle = () => {
    try {
      // Create and apply inline style
      const style = document.createElement('style')
      style.textContent = '.csp-test { color: green; }'
      document.head.appendChild(style)
      
      // Create test element
      const testElement = document.createElement('div')
      testElement.className = 'csp-test'
      testElement.textContent = '✅ Inline styles working'
      testElement.style.position = 'fixed'
      testElement.style.top = '10px'
      testElement.style.right = '10px'
      testElement.style.background = 'white'
      testElement.style.padding = '8px'
      testElement.style.borderRadius = '4px'
      testElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
      testElement.style.zIndex = '9999'
      
      document.body.appendChild(testElement)
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (document.body.contains(testElement)) {
          document.body.removeChild(testElement)
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }, 3000)
      
      console.log('✅ Inline style test passed')
    } catch (error) {
      console.error('❌ Inline style blocked:', error)
    }
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">CSP Monitor</h2>
        <p className="text-muted-foreground">
          Monitor Content Security Policy status and violations
        </p>
      </div>

      {/* CSP Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">CSP Status</h3>
        <div className="flex items-center gap-2">
          <Badge variant={
            cspStatus === 'enabled' ? 'default' : 
            cspStatus === 'disabled' ? 'destructive' : 'secondary'
          }>
            {cspStatus === 'enabled' ? 'CSP Enabled' : 
             cspStatus === 'disabled' ? 'CSP Disabled' : 'Checking...'}
          </Badge>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">CSP Tests</h3>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" onClick={testInlineScript}>
            Test Inline Script
          </Button>
          <Button variant="outline" onClick={testInlineStyle}>
            Test Inline Style
          </Button>
          <Button variant="outline" onClick={clearViolations}>
            Clear Violations
          </Button>
        </div>
      </div>

      {/* Violations List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          CSP Violations ({violations.length})
        </h3>
        
        {violations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No CSP violations detected. This is good! 🎉
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {violations.map((violation, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="destructive" className="text-xs">
                    Violation #{index + 1}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Directive:</span> {violation.violatedDirective}
                  </div>
                  <div>
                    <span className="font-medium">Blocked URI:</span> {violation.blockedURI}
                  </div>
                  <div>
                    <span className="font-medium">Source:</span> {violation.sourceFile}:{violation.lineNumber}:{violation.columnNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Policy:</span> {violation.originalPolicy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default CSPMonitor
