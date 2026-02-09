import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

interface VideoPlayerProps {
  questionNumber: number;
}

export function VideoPlayer({ questionNumber }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate playback progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  return (
    <div className="interview-card p-0 overflow-hidden">
      <div className="aspect-video bg-muted relative flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
          <p className="text-sm text-muted-foreground">
            Response to Question {questionNumber}
          </p>
        </div>

        {/* Video controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background/80 to-transparent p-4">
          {/* Progress bar */}
          <div className="progress-bar mb-3 cursor-pointer">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-primary" />
                ) : (
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                )}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-foreground" />
                )}
              </button>
              <span className="text-xs text-muted-foreground tabular-nums">
                0:{String(Math.floor(progress * 0.6)).padStart(2, "0")} / 1:00
              </span>
            </div>
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Maximize className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
