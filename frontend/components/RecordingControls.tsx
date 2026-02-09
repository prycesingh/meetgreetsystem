interface RecordingControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RecordingControls({ isRecording, onStart, onStop }: RecordingControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onStart}
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        disabled={isRecording}
      >
        Start Recording
      </button>
      <button
        type="button"
        onClick={onStop}
        className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
        disabled={!isRecording}
      >
        Stop Recording
      </button>
    </div>
  );
}
