import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 26 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1c1d21" />
          <stop offset="100%" stopColor="#101114" />
        </linearGradient>
      </defs>

      {/* Square Base with smooth squircle corners */}
      <rect
        x="24"
        y="24"
        width="464"
        height="464"
        rx="108"
        fill="url(#logoBg)"
        stroke="#2e3036"
        strokeWidth="14"
      />

      {/* Subtle inner ledger grid accent */}
      <line
        x1="80"
        y1="256"
        x2="432"
        y2="256"
        stroke="#26282e"
        strokeWidth="4"
        strokeDasharray="8 8"
      />

      {/* Left Spine of 'K' (Solid Reserve) */}
      <line
        x1="158"
        y1="140"
        x2="158"
        y2="372"
        stroke="#f4f3ef"
        strokeWidth="54"
        strokeLinecap="round"
      />

      {/* Upper Branch (Receivables / Inflow / Emerald) */}
      <line
        x1="228"
        y1="238"
        x2="346"
        y2="140"
        stroke="#10b981"
        strokeWidth="54"
        strokeLinecap="round"
      />

      {/* Lower Branch (Payables / Expenses / Terracotta) */}
      <line
        x1="228"
        y1="274"
        x2="346"
        y2="372"
        stroke="#f87171"
        strokeWidth="54"
        strokeLinecap="round"
      />
    </svg>
  );
}
