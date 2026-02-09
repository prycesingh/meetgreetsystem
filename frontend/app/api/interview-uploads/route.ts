export const runtime = "nodejs";

import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const DATA_ROOT = path.resolve(process.cwd(), "..", "data");

function sanitizeSegment(input: string): string {
  const cleaned = (input || "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return cleaned || "unknown";
}

async function ensureDirectory(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userId = sanitizeSegment(String(formData.get("userId") || ""));
    const interviewId = sanitizeSegment(
      String(formData.get("interviewId") || ""),
    );
    const videoIndex = sanitizeSegment(
      String(formData.get("videoIndex") || ""),
    );

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "Missing file" }, { status: 400 });
    }

    const fileExt = path.extname(file.name || "").toLowerCase() || ".webm";
    const safeFileName = `video-${videoIndex || "0"}${fileExt}`;
    const targetDir = path.join(DATA_ROOT, userId, interviewId);
    await ensureDirectory(targetDir);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const targetPath = path.join(targetDir, safeFileName);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json({
      message: "Saved",
      path: targetPath,
    });
  } catch (error) {
    console.error("Failed to save interview upload", error);
    return NextResponse.json(
      { message: "Failed to save upload" },
      { status: 500 },
    );
  }
}
