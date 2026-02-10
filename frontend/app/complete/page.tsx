"use client";

import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Suspense } from "react";

function CompletePageInner() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const isIncomplete = status === "incomplete";

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const refreshKey = "__complete_hard_refresh_ts__";
        const lastRefresh = Number(
          window.localStorage.getItem(refreshKey) ?? 0,
        );
        const now = Date.now();
        if (now - lastRefresh > 5000) {
          window.localStorage.setItem(refreshKey, String(now));
          window.location.reload();
          return;
        }
      } catch {
        // Storage unavailable; skip hard refresh to avoid loops.
      }
    }

    const stopAllMediaTracks = () => {
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

      if (typeof window !== "undefined") {
        const globalStreams = (
          window as typeof window & {
            __activeMediaStreams?: MediaStream[];
          }
        ).__activeMediaStreams;
        if (globalStreams && globalStreams.length > 0) {
          globalStreams.forEach((streamItem) => {
            streamItem.getTracks().forEach((track) => track.stop());
          });
        }
        (
          window as typeof window & {
            __activeMediaStreams?: MediaStream[];
          }
        ).__activeMediaStreams = [];
      }
    };

    stopAllMediaTracks();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        {/* Success Icon */}
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-8 ${
            isIncomplete ? "bg-destructive/10" : "bg-primary/10"
          }`}
        >
          {isIncomplete ? (
            <AlertTriangle className="w-10 h-10 text-destructive" />
          ) : (
            <CheckCircle className="w-10 h-10 text-primary" />
          )}
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {isIncomplete
            ? "Interview Ended Early"
            : "Interview Submitted Successfully"}
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          {isIncomplete
            ? "You ended the interview before completion. This may affect your evaluation."
            : "Thank you for completing your interview. Your responses have been recorded."}
        </p>

        {isIncomplete && (
          <div className="interview-card text-left mb-8 border-destructive/40 bg-destructive/5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Incomplete Interview
                </h3>
                <p className="text-sm text-muted-foreground">
                  Leaving early is recorded as an incomplete attempt. Your
                  remaining questions were not answered.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="interview-card text-left mb-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                Your responses are being evaluated by our AI system. This
                process typically takes 24-48 hours. You will receive an email
                notification once the review is complete.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="interview-card text-left mb-8">
          <h3 className="font-medium text-foreground mb-3">
            Interview Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-xs text-muted-foreground">
                Questions Answered
              </span>
              <p className="text-xl font-bold text-primary mt-1">5 / 5</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-xs text-muted-foreground">Status</span>
              <p className="text-sm font-semibold text-accent mt-1">
                Pending Review
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-sm text-muted-foreground mb-8">
          Please do not attempt to retake the interview. Only your first
          submission will be considered.
        </p>

        {/* Trainer Dashboard Link (for demo purposes) */}
        {/* <Button variant="outline" onClick={() => {}} className="gap-2">
          View Trainer Dashboard (Demo)
          <ArrowRight className="w-4 h-4" />
        </Button> */}
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense>
      <CompletePageInner />
    </Suspense>
  );
}
