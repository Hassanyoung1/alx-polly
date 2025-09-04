// Debug component to test delete button functionality
import React, { useState } from 'react';

export function DeleteButtonDebug() {
  const [showTestDialog, setShowTestDialog] = useState(false);

  const handleTestDelete = () => {
    console.log('🗑️ Delete button clicked!');
    alert('Delete button is working! Check console for more details.');
  };

  const handleTestEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 Event details:', e);
    console.log('🔍 Target:', e.target);
    console.log('🔍 Current target:', e.currentTarget);
  };

  const handleTestConfirmation = () => {
    console.log('🔍 Testing confirmation dialog...');
    setShowTestDialog(true);
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid red', 
      margin: '20px',
      backgroundColor: '#fff'
    }}>
      <h3>🔧 Delete Button Debug Panel</h3>
      <p>Testing delete button functionality:</p>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleTestDelete}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🗑️ Test Delete Button
        </button>

        <button 
          onClick={handleTestConfirmation}
          style={{
            padding: '8px 16px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Test Confirmation Dialog
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleTestEvent}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔍 Test Event Handling
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>Instructions:</p>
        <ul>
          <li>Click the red test button to verify basic functionality</li>
          <li>Click the green button to test confirmation dialog</li>
          <li>Check browser console for debug messages</li>
          <li>Look for any JavaScript errors</li>
        </ul>
      </div>

      {/* Test Confirmation Dialog */}
      {showTestDialog && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '400px',
              margin: '20px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Test Confirmation Dialog
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              This is a test confirmation dialog. It should appear on top of everything.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  console.log('🗑️ Test delete confirmed!');
                  setShowTestDialog(false);
                }}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Test Delete
              </button>
              <button
                onClick={() => {
                  console.log('🗑️ Test delete cancelled!');
                  setShowTestDialog(false);
                }}
                style={{
                  backgroundColor: 'white',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
