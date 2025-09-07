"use client";

import React, { useState } from 'react';

import { useAuth } from '@/lib/contexts/auth-context';

import { ProgressTracker } from '../feedback/progress-tracker';
import { Input } from '../forms/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Divider } from '../ui/divider';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signIn, isLoading, error, clearError, setError, operationId, clearOperationId, venueCount, estimatedDuration } = useAuth();
  // Helper function to get previous month's first and last day (IST timezone)
  const getPreviousMonthDates = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Get previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // First day of previous month
    const firstDay = new Date(previousYear, previousMonth, 1);
    
    // Last day of previous month (first day of current month minus 1 day)
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    // Format dates in local timezone (IST) as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay)
    };
  };

  const [formData, setFormData] = useState(() => {
    const { startDate, endDate } = getPreviousMonthDates();
    return {
      email: '',
      password: '',
      startDate,
      endDate,
    };
  });
  const [showProgress, setShowProgress] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Don't clear error automatically - let user see the error message
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors when starting new submission
    clearError();
    
    // Basic validation
    if (!formData.email || !formData.password || !formData.startDate || !formData.endDate) {
      return;
    }

    const result = await signIn({
      email: formData.email,
      password: formData.password,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });

    if (result.success) {
      // If we have an operation ID, show progress tracking
      if (result.operationId) {
        setShowProgress(true);
      } else {
        // Close modal on successful sign in (no progress tracking needed)
        onOpenChange(false);
        // Reset form with default dates
        const { startDate, endDate } = getPreviousMonthDates();
        setFormData({
          email: '',
          password: '',
          startDate,
          endDate,
        });
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    clearError();
    clearOperationId();
    setShowProgress(false);
    // Reset form when closing with default dates
    const { startDate, endDate } = getPreviousMonthDates();
    setFormData({
      email: '',
      password: '',
      startDate,
      endDate,
    });
  };

  const handleProgressComplete = () => {
    // Don't auto-close anymore - let user manually close after reading logs
    // This gives users full control over when to close the modal
  };

  const handleProgressError = (errorMessage: string) => {
    // If progress tracking shows authentication failed, show error and reset
    if (errorMessage.includes('Authentication failed') || errorMessage.includes('credentials do not match')) {
      setShowProgress(false);
      // Set the error message to be displayed in the form
      setError(errorMessage);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] space-y-6">
        <SheetHeader>
          <SheetTitle>Sign In to Generate Reports</SheetTitle>
          <SheetDescription>
            {showProgress 
              ? "Your report is being generated. Please wait while we process your request."
              : "Enter your credentials and select a date range to generate reports."
            }
          </SheetDescription>
        </SheetHeader>
        
        <Divider variant="glow" size="lg" />
        
        {showProgress ? (
          <div className="space-y-4">
            <ProgressTracker 
              operationId={operationId} 
              venueCount={venueCount}
              estimatedDuration={estimatedDuration}
              onComplete={handleProgressComplete}
              onError={handleProgressError}
            />
            <div className="pt-4 border-t">
              <Button
                onClick={handleClose}
                className="w-full h-10"
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Username
              </Badge>
              <Input
                id="email"
                type="email"
                placeholder="Enter Hudle Partner email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isLoading}
                variant="outline"
                inputSize="xl"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Badge variant="outline" className="w-fit">
                Password
              </Badge>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isLoading}
                variant="outline"
                inputSize="xl"
              />
            </div>

            {/* Date Range Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Start Date
                </Badge>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  disabled={isLoading}
                  variant="outline"
                  inputSize="xl"
                />
              </div>
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  End Date
                </Badge>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                  disabled={isLoading}
                  variant="outline"
                  inputSize="xl"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Badge variant="destructive" className="w-full justify-center py-2">
                Authentication Failed
              </Badge>
            )}
          </Card>

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password || !formData.startDate || !formData.endDate}
                className="h-10"
              >
                {isLoading ? 'Signing In...' : 'Request Report'}
              </Button>
            </SheetFooter>
          </form>
        )}
      
      </SheetContent>
    </Sheet>
  );
}
