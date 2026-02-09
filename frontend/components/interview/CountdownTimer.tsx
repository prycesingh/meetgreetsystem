"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  duration: number; // in seconds
  isRunning: boolean;
  onComplete?: () => void;
}

export function CountdownTimer({
  duration,
  isRunning,
  onComplete,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setTimeLeft(duration);
    hasCompletedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) {
      hasCompletedRef.current = false;
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onCompleteRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  const isLowTime = timeLeft <= 10;

  return (
    <div className="interview-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock
            className={`w-4 h-4 ${isLowTime ? "text-accent" : "text-primary"}`}
          />
          <span className="text-sm font-medium text-muted-foreground">
            Time Remaining
          </span>
        </div>
        <span
          className={`text-2xl font-bold tabular-nums ${
            isLowTime ? "text-accent" : "text-foreground"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${isLowTime ? "bg-accent!" : ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
