from pathlib import Path

from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.common import UploadResponse
from app.services.storage import append_metadata, ensure_user_storage_path, generate_upload_id

router = APIRouter(tags=["uploads"])


@router.post("/uploads", response_model=UploadResponse, status_code=201)
async def upload_answer(
    interview_id: str = Form(...),
    question_id: str = Form(...),
    user_id: str = Form(...),
    question_text: str | None = Form(None),
    question_audio_path: str | None = Form(None),
    started_at: str = Form(...),
    ended_at: str = Form(...),
    language_hint: str | None = Form(None),
    video: UploadFile = File(...),
    audio: UploadFile | None = File(None),
) -> UploadResponse:
    """
    Accept an uploaded answer recording.

    Integration notes:
    - Video is required; audio can be provided separately for higher fidelity.
    - Store files under a deterministic path by user/interview/question.
    - The processing pipeline runs asynchronously after upload.
    """
    upload_id = generate_upload_id()
    storage_path = ensure_user_storage_path(user_id)

    video_suffix = Path(video.filename or "").suffix or ".webm"
    video_filename = f"{upload_id}-video{video_suffix}"
    (storage_path / video_filename).write_bytes(await video.read())

    audio_filename = None
    if audio is not None:
        audio_suffix = Path(audio.filename or "").suffix or ".wav"
        audio_filename = f"{upload_id}-audio{audio_suffix}"
        (storage_path / audio_filename).write_bytes(await audio.read())

    append_metadata(
        user_id,
        {
            "upload_id": upload_id,
            "interview_id": interview_id,
            "question_id": question_id,
            "video_id": video_filename,
            "audio_id": audio_filename,
            "data": {
                "question_text": question_text,
                "question_audio_path": question_audio_path,
                "started_at": started_at,
                "ended_at": ended_at,
                "language_hint": language_hint,
            },
        },
    )

    return UploadResponse(
        upload_id=upload_id,
        storage_path=str(storage_path),
        status="queued",
        message="Upload accepted",
    )
