'use client';

import { Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

const REPO = 'https://github.com/anaysarkar7/draftroom';

const ISSUE_BODY = encodeURIComponent(
`## Describe the issue
<!-- A clear and concise description of what the bug is -->


## Steps to reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected behaviour
<!-- What did you expect to happen? -->


## Actual behaviour
<!-- What actually happened? -->


## Screenshots / recordings
<!-- If applicable, add screenshots or a screen recording to help explain your problem -->


## Environment
- OS:
- Browser:
- DraftRoom version: latest

---
*Reported via DraftRoom in-app feedback*`
);

const ISSUE_URL = `${REPO}/issues/new?labels=bug&title=Bug%3A+&body=${ISSUE_BODY}`;

interface ReportIssueButtonProps {
  variant?: 'icon' | 'full';   // icon = icon-only, full = icon + label
  className?: string;
}

export function ReportIssueButton({ variant = 'full', className }: ReportIssueButtonProps) {
  return (
    <a
      href={ISSUE_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Report an issue on GitHub"
      className={cn(
        'flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors',
        variant === 'full' && 'text-xs px-3 py-1.5 rounded-lg hover:bg-gray-800 border border-transparent hover:border-gray-700',
        variant === 'icon' && 'p-1.5 rounded-lg hover:bg-gray-800',
        className
      )}
    >
      <Bug size={variant === 'icon' ? 15 : 13} />
      {variant === 'full' && <span>Report Issue</span>}
    </a>
  );
}
