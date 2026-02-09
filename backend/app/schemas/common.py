from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UploadMetadata(BaseModel):
    interview_id: str
    question_id: str
    user_id: str
    question_text: str | None = None
    question_audio_path: str | None = None
    started_at: datetime
    ended_at: datetime
    language_hint: str | None = None


class UploadResponse(BaseModel):
    upload_id: str
    storage_path: str
    status: Literal["queued", "stored"]
    message: str


class TranscriptSegment(BaseModel):
    start_ms: int = Field(ge=0)
    end_ms: int = Field(gt=0)
    text: str
    confidence: float = Field(ge=0.0, le=1.0)
    language: str
    is_filler: bool = False


class LanguageSwitch(BaseModel):
    from_language: str = Field(alias="from")
    to_language: str = Field(alias="to")
    at_ms: int = Field(ge=0)


class TranscriptPayload(BaseModel):
    upload_id: str
    language: str
    segments: list[TranscriptSegment]
    raw_text: str
    pause_count: int = Field(ge=0)
    filler_count: int = Field(ge=0)
    switches: list[LanguageSwitch] = []


class TranscriptResponse(BaseModel):
    transcript_id: str
    status: Literal["stored"]


class AnswerScore(BaseModel):
    question_id: str
    score: float = Field(ge=0.0, le=5.0)
    notes: str | None = None


class RubricScore(BaseModel):
    category: str
    score: float = Field(ge=0.0, le=5.0)
    notes: str | None = None


class ResultPayload(BaseModel):
    interview_id: str
    user_id: str
    overall_score: float = Field(ge=0.0, le=5.0)
    rubric_scores: list[RubricScore]
    answer_scores: list[AnswerScore]


class ResultResponse(BaseModel):
    result_id: str
    status: Literal["stored"]
