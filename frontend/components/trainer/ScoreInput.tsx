import { useState } from 'react';

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ScoreInput({ label, value, onChange }: ScoreInputProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 11 }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`w-7 h-7 text-xs font-medium rounded transition-colors ${
              i === value
                ? 'bg-primary text-primary-foreground'
                : i <= value
                  ? 'bg-primary/30 text-primary hover:bg-primary/40'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
