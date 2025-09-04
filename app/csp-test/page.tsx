"use client"

import { CSPMonitor } from "@/components/csp-monitor"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

export default function CSPTestPage() {
  const [testResults, setTestResults] = useState<{
    evalTest: 'pending' | 'pass' | 'fail'
    inlineScriptTest: 'pending' | 'pass' | 'fail'
    inlineStyleTest: 'pending' | 'pass' | 'fail'
    externalResourceTest: 'pending' | 'pass' | 'fail'
  }>({
    evalTest: 'pending',
    inlineScriptTest: 'pending',
    inlineStyleTest: 'pending',
    externalResourceTest: 'pending'
  })

  const runAllTests = () => {
    console.log('🧪 Running CSP Tests...')
    
    // Test 1: eval() execution (should pass with 'unsafe-eval')
    try {
      eval('console.log("✅ eval() test passed")')
      setTestResults(prev => ({ ...prev, evalTest: 'pass' }))
    } catch (error) {
      console.error('❌ eval() test failed:', error)
      setTestResults(prev => ({ ...prev, evalTest: 'fail' }))
    }

    // Test 2: Inline script execution (should pass with 'unsafe-inline')
    try {
      const script = document.createElement('script')
      script.textContent = 'window.inlineScriptTest = true; console.log("✅ Inline script test passed")'
      document.head.appendChild(script)
      document.head.removeChild(script)
      
      setTimeout(() => {
        if ((window as any).inlineScriptTest) {
          setTestResults(prev => ({ ...prev, inlineScriptTest: 'pass' }))
        } else {
          setTestResults(prev => ({ ...prev, inlineScriptTest: 'fail' }))
        }
      }, 100)
    } catch (error) {
      console.error('❌ Inline script test failed:', error)
      setTestResults(prev => ({ ...prev, inlineScriptTest: 'fail' }))
    }

    // Test 3: Inline style execution (should pass with 'unsafe-inline')
    try {
      const style = document.createElement('style')
      style.textContent = '.csp-inline-test { color: green !important; }'
      document.head.appendChild(style)
      
      const testDiv = document.createElement('div')
      testDiv.className = 'csp-inline-test'
      testDiv.style.display = 'none'
      document.body.appendChild(testDiv)
      
      const computedStyle = window.getComputedStyle(testDiv)
      if (computedStyle.color === 'green' || computedStyle.color === 'rgb(0, 128, 0)') {
        setTestResults(prev => ({ ...prev, inlineStyleTest: 'pass' }))
        console.log('✅ Inline style test passed')
      } else {
        setTestResults(prev => ({ ...prev, inlineStyleTest: 'fail' }))
        console.log('❌ Inline style test failed')
      }
      
      // Cleanup
      document.body.removeChild(testDiv)
      document.head.removeChild(style)
    } catch (error) {
      console.error('❌ Inline style test failed:', error)
      setTestResults(prev => ({ ...prev, inlineStyleTest: 'fail' }))
    }

    // Test 4: External resource loading (fonts should pass)
    try {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
      
      link.onload = () => {
        setTestResults(prev => ({ ...prev, externalResourceTest: 'pass' }))
        console.log('✅ External resource test passed')
        document.head.removeChild(link)
      }
      
      link.onerror = () => {
        setTestResults(prev => ({ ...prev, externalResourceTest: 'fail' }))
        console.log('❌ External resource test failed')
        if (document.head.contains(link)) {
          document.head.removeChild(link)
        }
      }
      
      document.head.appendChild(link)
      
      // Timeout fallback
      setTimeout(() => {
        if (testResults.externalResourceTest === 'pending') {
          setTestResults(prev => ({ ...prev, externalResourceTest: 'fail' }))
        }
      }, 5000)
    } catch (error) {
      console.error('❌ External resource test failed:', error)
      setTestResults(prev => ({ ...prev, externalResourceTest: 'fail' }))
    }
  }

  const getStatusBadge = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">✅ Pass</Badge>
      case 'fail':
        return <Badge variant="destructive">❌ Fail</Badge>
      default:
        return <Badge variant="secondary">⏳ Pending</Badge>
    }
  }

  useEffect(() => {
    // Auto-run tests on component mount
    const timer = setTimeout(runAllTests, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CSP Test Page</h1>
        <p className="text-muted-foreground">
          Validate that Content Security Policy is configured correctly and not blocking required functionality.
        </p>
      </div>

      {/* Test Results Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">CSP Test Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">JavaScript eval() execution</span>
            {getStatusBadge(testResults.evalTest)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">Inline script execution</span>
            {getStatusBadge(testResults.inlineScriptTest)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">Inline style application</span>
            {getStatusBadge(testResults.inlineStyleTest)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">External resource loading</span>
            {getStatusBadge(testResults.externalResourceTest)}
          </div>
        </div>
        
        <Button onClick={runAllTests} variant="outline">
          Re-run Tests
        </Button>
      </Card>

      {/* CSP Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">CSP Configuration Info</h2>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Script Policy:</strong> <code>'self' 'unsafe-eval' 'unsafe-inline'</code>
            <p className="text-muted-foreground mt-1">
              Allows self-hosted scripts, eval() for Next.js/libraries, and inline scripts for development.
            </p>
          </div>
          
          <div>
            <strong>Style Policy:</strong> <code>'self' 'unsafe-inline' https://fonts.googleapis.com</code>
            <p className="text-muted-foreground mt-1">
              Allows self-hosted styles, inline styles for CSS-in-JS/Tailwind, and Google Fonts.
            </p>
          </div>
          
          <div>
            <strong>Connect Policy:</strong> <code>'self' https://*.supabase.co wss://*.supabase.co</code>
            <p className="text-muted-foreground mt-1">
              Allows API calls to same origin and Supabase endpoints (HTTP and WebSocket).
            </p>
          </div>
          
          <div>
            <strong>Image Policy:</strong> <code>'self' data: https: blob:</code>
            <p className="text-muted-foreground mt-1">
              Allows images from same origin, data URLs, HTTPS sources, and blob URLs.
            </p>
          </div>
        </div>
      </Card>

      {/* Live CSP Monitor */}
      <CSPMonitor />

      {/* Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">What to Check</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✅</span>
            <span>All test results should show "Pass" - this means CSP is properly configured</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✅</span>
            <span>Browser console should show no CSP violation errors</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✅</span>
            <span>Application should load and function normally</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✅</span>
            <span>Next.js development features (Hot Reload, Fast Refresh) should work</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
