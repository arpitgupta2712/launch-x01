"use client";

import React from 'react';

import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';

interface UploadPromptProps {
  onUploadClick: () => void;
  className?: string;
}

export function UploadPrompt({ onUploadClick, className }: UploadPromptProps) {
  return (
    <Card className={`p-6 space-y-4 ${className || ''}`}>
      <div className="text-center space-y-3">
        <Badge variant="outline" className="w-fit">
          Or Upload New File
        </Badge>
        <p className="text-sm text-muted-foreground">
          Don&apos;t see the file you want to process? Upload a new one.
        </p>
        <Button
          onClick={onUploadClick}
          variant="outline"
          className="w-full"
        >
          Upload New File
        </Button>
      </div>
    </Card>
  );
}
