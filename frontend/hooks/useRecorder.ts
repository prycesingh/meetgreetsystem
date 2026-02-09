import { useCallback, useMemo, useState } from "react";

import type { InterviewQuestion } from "../lib/apiTypes";

interface RecorderState {
  activeQuestion: InterviewQuestion | null;
  isRecording: boolean;
  timeRemaining: number;
  startRecording: () => void;
  stopRecording: () => void;
  setActiveQuestion: (index: number) => void;
}

export function useRecorder(questions: InterviewQuestion[]): RecorderState {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const activeQuestion = useMemo(() => {
    if (activeIndex === null) {
      return null;
    }
    return questions[activeIndex] ?? null;
  }, [activeIndex, questions]);

  const setActiveQuestion = useCallback(
    (index: number) => {
      const question = questions[index];
      if (!question) {
        return;
      }
      setActiveIndex(index);
      setTimeRemaining(question.timeLimitSeconds);
    },
    [questions]
  );

  const startRecording = useCallback(() => {
    if (!activeQuestion) {
      return;
    }
    setIsRecording(true);
  }, [activeQuestion]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  return {
    activeQuestion,
    isRecording,
    timeRemaining,
    startRecording,
    stopRecording,
    setActiveQuestion,
  };
}
