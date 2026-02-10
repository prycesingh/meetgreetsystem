import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

const DEFAULT_STORAGE_ROOT = path.resolve(process.cwd(), "tmp", "interview-uploads");

function getStorageRoot(): string {
  return process.env.STORAGE_ROOT ?? DEFAULT_STORAGE_ROOT;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const interviewId = String(formData.get("interview_id") ?? "unknown-interview");
    const questionId = String(formData.get("question_id") ?? "unknown-question");
    const userId = String(formData.get("user_id") ?? "unknown-user");
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json({ error: "video file is required" }, { status: 400 });
    }

    const uploadId = crypto.randomUUID();
    const storageRoot = getStorageRoot();
    const destinationDir = path.join(storageRoot, userId, interviewId, questionId);

    await mkdir(destinationDir, { recursive: true });

    const extension = path.extname(video.name) || ".webm";
    const filename = `${uploadId}-video${extension}`;
    const destinationPath = path.join(destinationDir, filename);

    const bytes = Buffer.from(await video.arrayBuffer());
    await writeFile(destinationPath, bytes);

    return NextResponse.json(
      {
        upload_id: uploadId,
        storage_path: destinationDir,
        status: "stored",
        message: "Upload accepted",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save interview upload", error);
    return NextResponse.json({ error: "Failed to save upload" }, { status: 500 });
  }
}
