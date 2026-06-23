"use client";

import React from "react";

const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
} as const;

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`${sizes[size]} rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
