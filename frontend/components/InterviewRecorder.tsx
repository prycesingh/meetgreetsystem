"use client";

import { useEffect } from "react";

import { QuestionCard } from "./QuestionCard";
import { RecordingControls } from "./RecordingControls";
import { useRecorder } from "../hooks/useRecorder";
import type { InterviewQuestion } from "../lib/apiTypes";

interface InterviewRecorderProps {
  interviewId: string;
  questions: InterviewQuestion[];
}

export function InterviewRecorder({ interviewId, questions }: InterviewRecorderProps) {
  const {
    activeQuestion,
    isRecording,
    timeRemaining,
    startRecording,
    stopRecording,
    setActiveQuestion,
  } = useRecorder(questions);

  useEffect(() => {
    if (questions.length > 0) {
      setActiveQuestion(0);
    }
  }, [questions, setActiveQuestion]);

  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Interview</p>
          <h2 className="text-xl font-semibold text-zinc-900">{interviewId}</h2>
        </div>
        <div className="rounded-full bg-zinc-100 px-4 py-1 text-sm text-zinc-600">
          {isRecording ? "Recording" : "Idle"}
        </div>
      </header>

      {activeQuestion && (
        <QuestionCard
          question={activeQuestion}
          timeRemaining={timeRemaining}
          isRecording={isRecording}
        />
      )}

      <RecordingControls
        isRecording={isRecording}
        onStart={startRecording}
        onStop={stopRecording}
      />
    </section>
  );
}
