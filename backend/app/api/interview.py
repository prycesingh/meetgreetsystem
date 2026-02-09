from fastapi import APIRouter

from app.schemas.common import TranscriptPayload, TranscriptResponse

router = APIRouter(tags=["interviews"])


@router.get("/questions")
def list_questions(interview_id: str) -> dict[str, object]:
    """
    Placeholder for dynamic question retrieval.

    Edge cases:
    - Handle missing interview IDs.
    - Support question order and optional follow-ups.
    """
    return {
        "interview_id": interview_id,
        "questions": [
            {
                "id": "q1",
                "text": "Tell me about yourself.",
                "time_limit_seconds": 90,
            }
        ],
    }


@router.post("/transcripts", response_model=TranscriptResponse)
def store_transcript(payload: TranscriptPayload) -> TranscriptResponse:
    """
    Store verbatim transcript results for a given upload.

    Integration notes:
    - Persist segments with timestamps for analytics and playback.
    - Save per-answer statistics (fillers, pauses, language switches).
    """
    return TranscriptResponse(transcript_id="tx-001", status="stored")
