import type { RecorderStatus } from "@/hooks/useRecorder";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CameraPreviewProps {
  status: RecorderStatus;
  stream: MediaStream | null;
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  showControls?: boolean;
  onToggleCamera?: () => void;
  onToggleMic?: () => void;
  error?: string | null;
}

export function CameraPreview({
  status,
  stream,
  isCameraEnabled,
  isMicEnabled,
  showControls = false,
  onToggleCamera,
  onToggleMic,
  error,
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (stream) {
      video.srcObject = stream;
      setIsPlaying(false);
      const handleLoaded = () => {
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => undefined);
        }
      };
      const handlePlaying = () => {
        setIsPlaying(true);
      };
      const handlePause = () => {
        setIsPlaying(false);
      };
      video.addEventListener("loadedmetadata", handleLoaded);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("pause", handlePause);
      handleLoaded();
      return () => {
        video.removeEventListener("loadedmetadata", handleLoaded);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("pause", handlePause);
      };
    } else {
      video.srcObject = null;
      setIsPlaying(false);
    }
  }, [stream]);

  const hasCamera = Boolean(stream?.getVideoTracks().length);
  const hasMic = Boolean(stream?.getAudioTracks().length);
  const isRequesting = status === "requesting";
  const showVideo = Boolean(stream && hasCamera && isCameraEnabled && !error);

  return (
    <div className="camera-preview relative w-full h-full">
      {/* Video backdrop */}
      <div className="absolute inset-0 bg-muted flex items-center justify-center z-0">
        {error ? (
          <div className="text-center px-6 max-w-md">
            <VideoOff className="w-12 h-12 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive leading-relaxed">{error}</p>
          </div>
        ) : hasCamera && isCameraEnabled && stream ? (
          <div className="w-full h-full bg-secondary" />
        ) : (
          <div className="text-center">
            <VideoOff className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isRequesting
                ? "Connecting camera..."
                : hasCamera
                  ? "Camera disabled"
                  : "Camera unavailable"}
            </p>
          </div>
        )}
      </div>

      {/* Video element for actual camera */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover z-10 ${
          showVideo ? "" : "hidden"
        }`}
      />

      {showVideo && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <p className="text-sm text-muted-foreground">Starting camera...</p>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={onToggleCamera}
            disabled={!hasCamera}
            className={`p-3 rounded-full transition-colors ${
              isCameraEnabled
                ? "bg-secondary hover:bg-muted"
                : "bg-destructive hover:bg-destructive/80"
            }`}
          >
            {isCameraEnabled ? (
              <Video className="w-5 h-5 text-foreground" />
            ) : (
              <VideoOff className="w-5 h-5 text-destructive-foreground" />
            )}
          </button>
          <button
            onClick={onToggleMic}
            disabled={!hasMic}
            className={`p-3 rounded-full transition-colors ${
              isMicEnabled
                ? "bg-secondary hover:bg-muted"
                : "bg-destructive hover:bg-destructive/80"
            }`}
          >
            {isMicEnabled ? (
              <Mic className="w-5 h-5 text-foreground" />
            ) : (
              <MicOff className="w-5 h-5 text-destructive-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
            hasCamera && isCameraEnabled
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Video className="w-3 h-3" />
          <span>{hasCamera && isCameraEnabled ? "Ready" : "Off"}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
            hasMic && isMicEnabled
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Mic className="w-3 h-3" />
          <span>{hasMic && isMicEnabled ? "Ready" : "Off"}</span>
        </div>
      </div>
    </div>
  );
}
