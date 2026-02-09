import type { InterviewQuestion } from "../lib/apiTypes";

interface QuestionCardProps {
  question: InterviewQuestion;
  timeRemaining: number;
  isRecording: boolean;
}

export function QuestionCard({ question, timeRemaining, isRecording }: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-zinc-500">Current Question</p>
          <h3 className="text-lg font-semibold text-zinc-900">{question.text}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Time left</p>
          <p className="text-2xl font-semibold text-zinc-900">
            {timeRemaining}s
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        {isRecording
          ? "Recording in progress. Speak clearly and naturally."
          : "Press start when ready to answer."}
      </p>
    </div>
  );
}
