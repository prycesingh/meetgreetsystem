import { AlertTriangle, ArrowRight, Mic, Video } from "lucide-react";
import Link from "next/link";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Meet & Greet Interview
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete your video interview in a few simple steps
          </p>
        </div>

        {/* Instructions Card */}
        <div className="interview-card mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Before You Begin
          </h2>

          <div className="space-y-4">
            {/* Requirement 1 */}
            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Camera Required
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ensure your camera is connected and working properly. You'll
                  need it throughout the interview.
                </p>
              </div>
            </div>

            {/* Requirement 2 */}
            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Microphone Required
                </h3>
                <p className="text-sm text-muted-foreground">
                  A working microphone is essential for recording your responses
                  clearly.
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-accent mb-1">
                  Important Notice
                </h3>
                <p className="text-sm text-muted-foreground">
                  This is a{" "}
                  <strong className="text-foreground">single attempt</strong>{" "}
                  interview. Do not refresh the page or switch tabs during the
                  interview. Your responses cannot be re-recorded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Details */}
        <div className="interview-card mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Interview Structure
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Total Questions</span>
              <p className="text-2xl font-bold text-primary mt-1">5</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Estimated Duration</span>
              <p className="text-2xl font-bold text-primary mt-1">~8 min</p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Link
          href="/interview"
          className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 flex items-center justify-center rounded-lg"
        >
          Start Interview
          <ArrowRight className="w-5 h-5" />
        </Link>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By clicking "Start Interview", you agree to allow camera and
          microphone access
        </p>
      </div>
    </div>
  );
};

export default Index;
