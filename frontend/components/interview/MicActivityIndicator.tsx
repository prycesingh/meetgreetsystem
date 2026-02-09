import { Mic } from "lucide-react";
import { useEffect, useState } from "react";

interface MicActivityIndicatorProps {
  isActive: boolean;
  level?: number;
}

const buildLevels = (level: number) => {
  const clamped = Math.max(0, Math.min(1, level));
  const base = 0.15 + clamped * 0.85;
  return [
    Math.max(0.1, base * 0.6),
    Math.max(0.1, base * 0.8),
    Math.max(0.1, base),
    Math.max(0.1, base * 0.85),
    Math.max(0.1, base * 0.7),
  ];
};

export function MicActivityIndicator({
  isActive,
  level = 0,
}: MicActivityIndicatorProps) {
  const [levels, setLevels] = useState([0.2, 0.3, 0.5, 0.4, 0.3]);
  const clamped = Math.max(0, Math.min(1, level));
  const levelPercent = Math.round(clamped * 100);

  useEffect(() => {
    if (!isActive) {
      setLevels([0.1, 0.1, 0.1, 0.1, 0.1]);
      return;
    }

    setLevels(buildLevels(level));
  }, [isActive, level]);

  return (
    <div className="px-4 py-3 bg-card rounded-lg border border-border space-y-2">
      <div className="flex items-center gap-3">
        <Mic
          className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
        />
        <div className="flex items-end gap-0.5 h-5">
          {levels.map((level, index) => (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-100 ${
                isActive ? "bg-primary" : "bg-muted"
              }`}
              style={{ height: `${level * 100}%` }}
            />
          ))}
        </div>
        <span
          className={`text-sm ${isActive ? "text-foreground" : "text-muted-foreground"}`}
        >
          {isActive ? "Listening" : "Muted"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              isActive ? "bg-primary" : "bg-muted-foreground/40"
            }`}
            style={{ width: `${isActive ? levelPercent : 0}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground w-10 text-right">
          {isActive ? `${levelPercent}%` : "0%"}
        </span>
      </div>
    </div>
  );
}
