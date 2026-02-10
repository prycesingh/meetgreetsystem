"use client";
import { CameraPreview } from "@/components/interview/CameraPreview";
import { CountdownTimer } from "@/components/interview/CountdownTimer";
import { MicActivityIndicator } from "@/components/interview/MicActivityIndicator";
import { ProgressIndicator } from "@/components/interview/ProgressIndicator";
import { QuestionDisplay } from "@/components/interview/QuestionDisplay";
import { RecordingIndicator } from "@/components/interview/RecordingIndicator";
import { Button } from "@/components/ui/button";
import { useInterview } from "@/hooks/useInterview";
import { useRecorder } from "@/hooks/useRecorder";
import { mockQuestions } from "@/utils/mockQuestions";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const sanitizeSegment = (value: string) =>
  value.trim().replace(/[^a-zA-Z0-9._-]+/g, "_");

const buildInterviewId = () => {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .replace(/\..+/, "");
  return `interview-${stamp}`;
};

import { Suspense } from "react";

function InterviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recorder = useRecorder();
  const { requestPermissions, releaseMedia } = recorder;
  const interview = useInterview({ totalQuestions: mockQuestions.length });
  const {
    phase,
    currentQuestionIndex,
    isStarted,
    error,
    setReady,
    setChecking,
    startInterview,
    markUploading,
    advanceAfterUpload,
    setError,
    reset,
  } = interview;
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [speakerError, setSpeakerError] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [interviewId, setInterviewId] = useState("");
  const [isTimerArmed, setIsTimerArmed] = useState(false);
  const userIdentifierRef = useRef("");
  const interviewIdRef = useRef("");
  const lastCompletedIndexRef = useRef<number | null>(null);
  const isCompletingRef = useRef(false);

  const permissionsGranted = Boolean(recorder.stream);
  const isReadyToStart =
    recorder.status === "ready" || recorder.status === "stopped";
  const hasCamera = Boolean(recorder.stream?.getVideoTracks().length);
  const hasMic = Boolean(recorder.stream?.getAudioTracks().length);
  const canStart =
    isReadyToStart &&
    hasCamera &&
    hasMic &&
    recorder.isCameraEnabled &&
    recorder.isMicEnabled &&
    !error;

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  useEffect(() => {
    if (recorder.status === "ready" || recorder.status === "recording") {
      setReady();
      return;
    }
    if (recorder.status === "requesting") {
      setChecking();
      return;
    }
    if (recorder.status === "error" && recorder.error) {
      setError(recorder.error);
    }
  }, [recorder.error, recorder.status, setChecking, setError, setReady]);

  useEffect(() => {
    if (phase !== "recording") {
      setIsTimerArmed(false);
    }
  }, [phase]);

  const resolveUserIdentifier = useCallback(() => {
    const paramValue =
      searchParams.get("user") ?? searchParams.get("email") ?? "";
    if (paramValue) {
      return paramValue;
    }

    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("interviewUserIdentifier");
      if (saved) {
        return saved;
      }
    }

    return "unknown-user";
  }, [searchParams]);

  const initializeDatasetStorage = useCallback(async () => {
    const resolvedUser = userIdentifier || resolveUserIdentifier();
    if (!userIdentifier) {
      setUserIdentifier(resolvedUser);
    }
    userIdentifierRef.current = resolvedUser;

    const resolvedInterviewId = interviewId || buildInterviewId();
    if (!interviewId) {
      setInterviewId(resolvedInterviewId);
    }
    interviewIdRef.current = resolvedInterviewId;
  }, [interviewId, resolveUserIdentifier, userIdentifier]);

  const persistRecording = useCallback(
    async (blob: Blob, videoIndex: number) => {
      const safeUser = sanitizeSegment(
        userIdentifierRef.current || userIdentifier || "unknown-user",
      );
      const safeInterview = sanitizeSegment(
        interviewIdRef.current || interviewId || buildInterviewId(),
      );
      const extension = blob.type.includes("webm") ? "webm" : "dat";
      const fileName = `video-${videoIndex}.${extension}`;

      const payload = new FormData();
      payload.append("userId", safeUser);
      payload.append("interviewId", safeInterview);
      payload.append("videoIndex", String(videoIndex));
      payload.append(
        "file",
        new File([blob], fileName, { type: blob.type || "video/webm" }),
      );

      const response = await fetch("/api/interview-uploads", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Failed to save interview clip.");
      }
    },
    [interviewId, userIdentifier],
  );

  const handleStartInterview = async () => {
    if (!canStart) {
      if (!hasCamera || !hasMic) {
        setError("Camera and microphone are required to start the interview.");
      }
      return;
    }

    if (!permissionsGranted) {
      await recorder.requestPermissions();
      if (recorder.status === "error") {
        return;
      }
    }

    await initializeDatasetStorage();
    lastCompletedIndexRef.current = null;
    isCompletingRef.current = false;
    startInterview();
    await recorder.startRecording();
    setIsTimerArmed(true);
  };

  const handleMicTest = async () => {
    await recorder.requestPermissions();
  };

  const handleSpeakerTest = async () => {
    setSpeakerError(null);
    setIsTestingSpeaker(true);

    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextCtor) {
        throw new Error("AudioContext not supported");
      }
      const audioContext = new AudioContextCtor();
      await audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 440;
      gain.gain.value = 0.2;
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
        setIsTestingSpeaker(false);
      }, 600);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to play test tone. Check browser audio settings.";
      setSpeakerError(message);
      setIsTestingSpeaker(false);
    }
  };

  const stopAllMediaTracks = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }
    const mediaElements = document.querySelectorAll("video, audio");
    mediaElements.forEach((element) => {
      const mediaElement = element as HTMLMediaElement;
      const srcObject = mediaElement.srcObject;
      if (srcObject instanceof MediaStream) {
        srcObject.getTracks().forEach((track) => track.stop());
      }
      mediaElement.srcObject = null;
    });
  }, []);

  useEffect(() => {
    return () => {
      releaseMedia();
      stopAllMediaTracks();
    };
  }, [releaseMedia, stopAllMediaTracks]);

  useEffect(() => {
    const handlePageHide = () => {
      releaseMedia();
      stopAllMediaTracks();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handlePageHide();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [releaseMedia, stopAllMediaTracks]);

  const handleEndInterview = async () => {
    await recorder.stopRecording();
    releaseMedia();
    stopAllMediaTracks();
    setRecordedBlobs([]);
    setSpeakerError(null);
    setUserIdentifier("");
    setInterviewId("");
    userIdentifierRef.current = "";
    interviewIdRef.current = "";
    lastCompletedIndexRef.current = null;
    isCompletingRef.current = false;
    setIsTimerArmed(false);
    reset();
    router.push("/complete?status=incomplete");
  };

  const handleFinishInterview = async () => {
    await recorder.stopRecording();
    releaseMedia();
    stopAllMediaTracks();
    setSpeakerError(null);
    setUserIdentifier("");
    setInterviewId("");
    userIdentifierRef.current = "";
    interviewIdRef.current = "";
    lastCompletedIndexRef.current = null;
    isCompletingRef.current = false;
    setIsTimerArmed(false);
    router.push("/complete?status=complete");
  };

  const handleQuestionComplete = useCallback(async () => {
    if (phase !== "recording") {
      return;
    }

    if (isCompletingRef.current) {
      return;
    }

    if (lastCompletedIndexRef.current === currentQuestionIndex) {
      return;
    }

    isCompletingRef.current = true;
    lastCompletedIndexRef.current = currentQuestionIndex;
    setIsTimerArmed(false);

    markUploading();

    const isLastQuestion = currentQuestionIndex >= mockQuestions.length - 1;
    const blob = await recorder.stopRecording();
    if (blob) {
      setRecordedBlobs((prev) => [...prev, blob]);
      try {
        await persistRecording(blob, currentQuestionIndex + 1);
      } catch (persistError) {
        const message =
          persistError instanceof Error
            ? persistError.message
            : "Failed to save interview clip.";
        setError(message);
        isCompletingRef.current = false;
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!isLastQuestion) {
      await recorder.startRecording();
      setIsTimerArmed(true);
    }

    advanceAfterUpload();
    isCompletingRef.current = false;
  }, [
    advanceAfterUpload,
    currentQuestionIndex,
    markUploading,
    phase,
    persistRecording,
    recorder,
  ]);

  const question = useMemo(
    () => mockQuestions[currentQuestionIndex],
    [currentQuestionIndex],
  );

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-foreground">
            AI Interview
          </h1>
          <div className="flex items-center gap-3">
            {(isStarted || phase === "uploading") && phase !== "complete" && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleEndInterview}
              >
                End Interview
              </Button>
            )}
            <RecordingIndicator
              isRecording={phase === "recording"}
              status={
                phase === "recording"
                  ? "recording"
                  : phase === "uploading"
                    ? "uploading"
                    : "ready"
              }
            />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Preview - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-card border border-border">
              {phase === "checking" ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-muted-foreground">
                    Checking camera and microphone...
                  </p>
                </div>
              ) : (
                <CameraPreview
                  status={recorder.status}
                  stream={recorder.stream}
                  isCameraEnabled={recorder.isCameraEnabled}
                  isMicEnabled={recorder.isMicEnabled}
                  onToggleCamera={recorder.toggleCamera}
                  onToggleMic={recorder.toggleMic}
                  error={error}
                  showControls={!isStarted}
                />
              )}
            </div>

            {/* Start Button or Question Display */}
            <div className="mt-6">
              {!isStarted ? (
                <div className="text-center">
                  <Button
                    onClick={handleStartInterview}
                    disabled={recorder.status === "requesting" || !canStart}
                    size="lg"
                    className="h-14 px-12 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {recorder.status === "requesting"
                      ? "Requesting permissions..."
                      : canStart
                        ? "Start Interview"
                        : "Enable camera and microphone"}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Once started, questions will auto-advance. No pause or retry
                    available.
                  </p>
                  <div className="mt-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleEndInterview}
                    >
                      End Interview
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {phase === "complete" ? (
                    <div className="interview-card">
                      <h2 className="text-lg font-semibold text-foreground">
                        Interview complete
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        Thank you for completing all questions. If you are
                        ready, click Finish Interview to submit your responses.
                      </p>
                    </div>
                  ) : (
                    <QuestionDisplay
                      questionNumber={currentQuestionIndex + 1}
                      totalQuestions={mockQuestions.length}
                      questionText={question.text}
                      isActive={phase === "recording"}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Timer, Progress, Mic */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="interview-card">
              <ProgressIndicator
                current={currentQuestionIndex + (isStarted ? 1 : 0)}
                total={mockQuestions.length}
              />
            </div>

            {/* Timer */}
            {isStarted && (
              <CountdownTimer
                key={question.id}
                duration={question.duration}
                isRunning={isStarted && phase === "recording" && isTimerArmed}
                onComplete={handleQuestionComplete}
              />
            )}

            {/* Mic Activity */}
            <MicActivityIndicator
              isActive={recorder.isMicEnabled && Boolean(recorder.stream)}
              level={recorder.audioLevel}
            />

            {/* Audio Test */}
            <div className="interview-card">
              <h3 className="font-medium text-foreground mb-3">Audio Test</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSpeakerTest}
                  disabled={isTestingSpeaker}
                >
                  {isTestingSpeaker ? "Playing..." : "Test Speaker"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleMicTest}
                >
                  Test Mic
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Speak and watch the mic bars above.
              </p>
              {speakerError && (
                <p className="text-xs text-destructive mt-2">{speakerError}</p>
              )}
            </div>

            {/* Instructions */}
            <div className="interview-card">
              <h3 className="font-medium text-foreground mb-3">Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>
                    Speak clearly and maintain eye contact with the camera
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Answer within the time limit for each question</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Do not refresh or leave this page</span>
                </li>
              </ul>
            </div>

            {/* State indicator for uploading */}
            {phase === "uploading" && (
              <div className="interview-card border-primary/50 bg-primary/5">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <div>
                    <p className="font-medium text-foreground">
                      Preparing next question...
                    </p>
                    <p className="text-sm text-muted-foreground">Please wait</p>
                  </div>
                </div>
              </div>
            )}

            {phase === "complete" && (
              <div className="interview-card border-primary/50 bg-primary/5">
                <p className="font-medium text-foreground">
                  Interview complete. {recordedBlobs.length} responses captured.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Please review the closing message and finish the interview.
                </p>
                <div className="mt-4">
                  <Button
                    type="button"
                    className="bg-emerald-500 text-white hover:bg-emerald-600"
                    onClick={handleFinishInterview}
                  >
                    Finish Interview
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense>
      <InterviewPageInner />
    </Suspense>
  );
}
