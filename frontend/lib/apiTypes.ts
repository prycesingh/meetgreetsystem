export interface InterviewQuestion {
  id: string;
  text: string;
  timeLimitSeconds: number;
}

export interface UploadResponse {
  uploadId: string;
  storagePath: string;
  status: "queued" | "stored";
  message: string;
}

export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
  language: string;
  isFiller: boolean;
}

export interface TranscriptPayload {
  uploadId: string;
  language: string;
  segments: TranscriptSegment[];
  rawText: string;
  pauseCount: number;
  fillerCount: number;
  switches: Array<{ from: string; to: string; atMs: number }>;
}

export interface ResultPayload {
  interviewId: string;
  userId: string;
  overallScore: number;
  dimensions: Record<string, number>;
  answerScores: Array<{ questionId: string; score: number; notes?: string }>;
}
