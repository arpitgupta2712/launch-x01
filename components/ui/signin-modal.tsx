"use client";

import React, { useState } from 'react';

import { useAuth } from '@/lib/contexts/auth-context';

import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { Label } from './label';
import { ProgressTracker } from './progress-tracker';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './sheet';

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signIn, isLoading, error, clearError, operationId, clearOperationId } = useAuth();
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
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] space-y-6">
        <SheetHeader>
          <SheetTitle>Sign In to Generate Reports</SheetTitle>
          <SheetDescription>
            {showProgress 
              ? "Your report is being generated. Please wait while we process your request."
              : "Enter your credentials and select a date range to generate reports."
            }
          </SheetDescription>
        </SheetHeader>
        
        {showProgress ? (
          <div className="space-y-4">
            <ProgressTracker 
              operationId={operationId} 
              onComplete={handleProgressComplete}
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
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            {/* Date Range Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
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
