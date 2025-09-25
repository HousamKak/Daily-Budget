import React from "react";

const IconBase = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconBase>
);

export const Plus = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconBase>
);

export const Trash = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </IconBase>
);

export const ChevronLeft = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <polyline points="15 18 9 12 15 6" />
  </IconBase>
);

export const ChevronRight = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <polyline points="9 18 15 12 9 6" />
  </IconBase>
);

export const Wallet = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M16 10h4v4h-4z" />
    <path d="M2 10h12" />
  </IconBase>
);

export const CheckCircle = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </IconBase>
);

export const Info = ({ className }: { className?: string }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="8" />
  </IconBase>
);