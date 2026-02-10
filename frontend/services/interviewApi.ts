import type { InterviewQuestion, ResultPayload, TranscriptPayload, UploadResponse } from "../lib/apiTypes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchQuestions(interviewId: string): Promise<InterviewQuestion[]> {
  const response = await fetch(`${BASE_URL}/api/questions?interview_id=${interviewId}`);
  if (!response.ok) {
    throw new Error("Failed to load questions");
  }
  const data = await response.json();
  return data.questions;
}

export async function uploadAnswer(formData: FormData): Promise<UploadResponse> {
  const response = await fetch(`${BASE_URL}/api/uploads`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return {
    uploadId: data.upload_id,
    storagePath: data.storage_path,
    status: data.status,
    message: data.message,
  };
}

export async function submitTranscript(payload: TranscriptPayload): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/transcripts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Transcript submission failed");
  }
}

export async function submitResults(payload: ResultPayload): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/results`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Result submission failed");
  }
}
