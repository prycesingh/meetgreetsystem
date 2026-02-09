"use client";

import { useCallback, useState } from "react";

export type InterviewPhase =
  | "checking"
  | "ready"
  | "recording"
  | "uploading"
  | "complete"
  | "error";

interface UseInterviewOptions {
  totalQuestions: number;
}

interface UseInterviewState {
  phase: InterviewPhase;
  currentQuestionIndex: number;
  isStarted: boolean;
  error: string | null;
  setReady: () => void;
  setChecking: () => void;
  startInterview: () => void;
  markUploading: () => void;
  advanceAfterUpload: () => void;
  setError: (message: string) => void;
  reset: () => void;
}

const buildInitialState = () => ({
  phase: "checking" as InterviewPhase,
  currentQuestionIndex: 0,
  isStarted: false,
  error: null as string | null,
});

export const useInterview = (
  options: UseInterviewOptions,
): UseInterviewState => {
  const { totalQuestions } = options;
  const [state, setState] = useState(buildInitialState());

  const setReady = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: prev.isStarted ? "recording" : "ready",
      error: null,
    }));
  }, []);

  const setChecking = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "checking",
    }));
  }, []);

  const startInterview = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isStarted: true,
      phase: "recording",
      error: null,
    }));
  }, []);

  const markUploading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "uploading",
    }));
  }, []);

  const advanceAfterUpload = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex >= totalQuestions) {
        return {
          ...prev,
          phase: "complete",
        };
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        phase: "recording",
      };
    });
  }, [totalQuestions]);

  const setError = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      phase: "error",
      error: message,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(buildInitialState());
  }, []);

  return {
    phase: state.phase,
    currentQuestionIndex: state.currentQuestionIndex,
    isStarted: state.isStarted,
    error: state.error,
    setReady,
    setChecking,
    startInterview,
    markUploading,
    advanceAfterUpload,
    setError,
    reset,
  };
};
