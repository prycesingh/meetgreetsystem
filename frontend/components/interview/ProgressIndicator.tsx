interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Progress</span>
        <span className="text-sm font-medium text-foreground">
          {current} / {total}
        </span>
      </div>
      <div className="progress-bar h-2">
        <div 
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index < current 
                ? 'bg-primary' 
                : index === current 
                  ? 'bg-accent' 
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
