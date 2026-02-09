interface RecordingIndicatorProps {
  isRecording: boolean;
  status?: "ready" | "recording" | "uploading" | "complete";
}

export function RecordingIndicator({
  isRecording,
  status = "ready",
}: RecordingIndicatorProps) {
  const statusConfig = {
    ready: {
      text: "Ready to Record",
      dotClass: "bg-muted-foreground",
      textClass: "text-muted-foreground",
    },
    recording: {
      text: "Recording",
      dotClass: "bg-accent animate-pulse-soft",
      textClass: "text-accent",
    },
    uploading: {
      text: "Uploading...",
      dotClass: "bg-primary animate-pulse",
      textClass: "text-primary",
    },
    complete: {
      text: "Submitted",
      dotClass: "bg-primary",
      textClass: "text-primary",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      <span className={`text-sm font-medium ${config.textClass}`}>
        {config.text}
      </span>
    </div>
  );
}
