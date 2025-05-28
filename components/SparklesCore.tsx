import React from "react";

// Simple animated sparkles background for sci-fi effect
export function SparklesCore({ color = "#00fff7" }: { color?: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
      <defs>
        <radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 32 }).map((_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const r = 0.7 + Math.random() * 1.5;
        const opacity = 0.2 + Math.random() * 0.5;
        return (
          <circle
            key={i}
            cx={`${x}%`}
            cy={`${y}%`}
            r={r}
            fill="url(#sparkle)"
            opacity={opacity}
          >
            <animate
              attributeName="opacity"
              values={`${opacity};0;${opacity}`}
              dur={`${2 + Math.random() * 3}s`}
              repeatCount="indefinite"
              begin={`${Math.random() * 2}s`}
            />
          </circle>
        );
      })}
    </svg>
  );
}
