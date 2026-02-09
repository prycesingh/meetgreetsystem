interface QuestionDisplayProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  isActive: boolean;
}

export function QuestionDisplay({
  questionNumber,
  totalQuestions,
  questionText,
  isActive,
}: QuestionDisplayProps) {
  return (
    <div className={`interview-card transition-opacity duration-300 ${
      isActive ? 'opacity-100' : 'opacity-50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-primary">
          Question {questionNumber} of {totalQuestions}
        </span>
        {isActive && (
          <span className="flex items-center gap-2 text-sm text-accent">
            <span className="recording-dot" />
            Active
          </span>
        )}
      </div>
      <p className="text-lg font-medium text-foreground leading-relaxed">
        {questionText}
      </p>
    </div>
  );
}
