# Progress Tracking System - Frontend Integration Guide

## Overview

The ClayGrounds Server includes a comprehensive progress tracking system for monitoring long-running operations in real-time. This system provides real-time updates, detailed logging, and status tracking for various backend operations.

## Business Value

- **Real-time User Feedback**: Users can see operation progress without page refreshes
- **Transparency**: Detailed logs show exactly what's happening during operations
- **Better UX**: No more "loading..." spinners - users see actual progress
- **Error Handling**: Clear error messages and failure reasons
- **Audit Trail**: Complete operation history with timestamps

## Supported Operations

### Currently Implemented
1. **Email Export Operations** (`/api/hudle/reports/email`)
   - Export booking data from multiple venues
   - Shows venue-by-venue progress
   - Displays success/failure rates

2. **Booking File Processing** (`/api/hudle/reports/process`)
   - Batch processing of Excel files
   - File-by-file progress tracking
   - Upload statistics

### Extensible Design
The system is designed to support any long-running operation. New operations can easily be added by:
- Creating a progress tracker
- Updating progress during operation
- Completing or failing the operation

## API Endpoints

### Get Progress Information
```
GET /api/progress/{operationId}
```

**Response Format:**
```json
{
  "success": true,
  "progress": {
    "id": "op_1757169376166_kogxf4p4u",
    "status": "completed", // pending, running, completed, failed, timeout
    "progress": 100, // 0-100 percentage
    "total": 6, // total items to process
    "current": 6, // current item being processed
    "duration": 3, // seconds elapsed
    "startTime": "2025-09-06T14:36:16.166Z",
    "endTime": "2025-09-06T14:36:24.537Z",
    "logs": [
      {
        "message": "🚀 Starting batch email export for 6 locations",
        "timestamp": "2025-09-06T14:36:24.537Z",
        "level": "info" // info, warn, error
      }
    ],
    "data": {
      "operation": "emailExport",
      "startDate": "2025-08-01",
      "endDate": "2025-08-31"
    },
    "error": null // error message if failed
  }
}
```

## Frontend Integration Patterns

### 1. Basic Progress Polling

```javascript
class ProgressTracker {
  constructor(operationId, onUpdate, onComplete) {
    this.operationId = operationId;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.isPolling = false;
  }

  start() {
    this.isPolling = true;
    this.poll();
  }

  stop() {
    this.isPolling = false;
  }

  async poll() {
    if (!this.isPolling) return;

    try {
      const response = await fetch(`/api/progress/${this.operationId}`);
      const data = await response.json();

      if (data.success) {
        this.onUpdate(data.progress);

        // Check if operation is complete
        if (data.progress.status === 'completed' || data.progress.status === 'failed') {
          this.onComplete(data.progress);
          this.stop();
          return;
        }
      }

      // Continue polling every 2 seconds
      setTimeout(() => this.poll(), 2000);
    } catch (error) {
      console.error('Progress polling error:', error);
      setTimeout(() => this.poll(), 5000); // Retry after 5 seconds on error
    }
  }
}
```

### 2. React Hook Implementation

```javascript
import { useState, useEffect, useCallback } from 'react';

export const useProgressTracking = (operationId) => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startTracking = useCallback(() => {
    if (!operationId) return;
    
    setIsLoading(true);
    setError(null);

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/progress/${operationId}`);
        const data = await response.json();

        if (data.success) {
          setProgress(data.progress);

          // Stop polling when complete
          if (data.progress.status === 'completed' || data.progress.status === 'failed') {
            setIsLoading(false);
            return;
          }
        }

        // Continue polling
        setTimeout(pollProgress, 2000);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    pollProgress();
  }, [operationId]);

  useEffect(() => {
    if (operationId) {
      startTracking();
    }
  }, [operationId, startTracking]);

  return { progress, isLoading, error, startTracking };
};
```

### 3. React Component Example

```jsx
import React from 'react';
import { useProgressTracking } from './hooks/useProgressTracking';

const EmailExportProgress = ({ operationId }) => {
  const { progress, isLoading, error } = useProgressTracking(operationId);

  if (!progress) return <div>Waiting for operation to start...</div>;

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Email Export Progress</h3>
        <span className={`status ${progress.status}`}>
          {progress.status.toUpperCase()}
        </span>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      <div className="progress-info">
        <span>{progress.current} of {progress.total} venues processed</span>
        <span>Duration: {progress.duration}s</span>
      </div>

      <div className="progress-logs">
        <h4>Operation Logs:</h4>
        <div className="logs-container">
          {progress.logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.level}`}>
              <span className="timestamp">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {progress.status === 'failed' && (
        <div className="error-message">
          <strong>Operation Failed:</strong> {progress.error}
        </div>
      )}
    </div>
  );
};

export default EmailExportProgress;
```

## UI/UX Recommendations

### 1. Progress Display
- **Progress Bar**: Visual percentage completion
- **Status Badge**: Color-coded status (pending, running, completed, failed)
- **Counter**: "X of Y items processed"
- **Duration**: Time elapsed

### 2. Log Display
- **Real-time Updates**: Logs appear as they're generated
- **Log Levels**: Different colors for info, warn, error
- **Timestamps**: Show when each log entry occurred
- **Scrollable**: Handle large log lists gracefully

### 3. Error Handling
- **Clear Error Messages**: Show specific failure reasons
- **Retry Options**: Allow users to retry failed operations
- **Contact Support**: Link to help when appropriate

### 4. Performance Considerations
- **Polling Interval**: 2 seconds is optimal (not too frequent, not too slow)
- **Log Limits**: Backend returns last 50 logs to prevent memory issues
- **Auto-cleanup**: Progress data is cleaned up after 1 hour

## Example Integration Flow

### 1. Start Operation
```javascript
// User clicks "Export Emails" button
const startEmailExport = async () => {
  const response = await fetch('/api/hudle/emailExport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: '2025-08-01',
      endDate: '2025-08-31',
      email: 'user@example.com',
      password: 'password'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Start tracking progress
    setOperationId(data.operationId);
    setShowProgress(true);
  }
};
```

### 2. Track Progress
```javascript
// Use the hook to track progress
const { progress, isLoading } = useProgressTracking(operationId);

// Display progress in UI
if (showProgress && progress) {
  return <EmailExportProgress operationId={operationId} />;
}
```

### 3. Handle Completion
```javascript
// In the progress component
useEffect(() => {
  if (progress?.status === 'completed') {
    // Show success message
    showNotification('Email export completed successfully!');
    // Maybe redirect or refresh data
  } else if (progress?.status === 'failed') {
    // Show error message
    showNotification('Email export failed: ' + progress.error, 'error');
  }
}, [progress?.status]);
```


## Testing

### Manual Testing
1. Start an email export operation
2. Check progress endpoint returns valid data
3. Verify logs update in real-time
4. Test error scenarios

### Automated Testing
```javascript
// Test progress tracking
describe('Progress Tracking', () => {
  it('should track email export progress', async () => {
    const response = await fetch('/api/hudle/emailExport', {
      method: 'POST',
      body: JSON.stringify({ startDate: '2025-08-01', endDate: '2025-08-31' })
    });
    
    const { operationId } = await response.json();
    
    // Poll progress
    const progressResponse = await fetch(`/api/progress/${operationId}`);
    const progress = await progressResponse.json();
    
    expect(progress.success).toBe(true);
    expect(progress.progress.status).toBeDefined();
  });
});
```

## Security Considerations

- **Operation IDs**: Are unique and unpredictable
- **No Sensitive Data**: Logs don't contain passwords or tokens
- **Auto-cleanup**: Progress data is automatically removed after 1 hour
- **Rate Limiting**: Consider implementing rate limiting on progress endpoint
