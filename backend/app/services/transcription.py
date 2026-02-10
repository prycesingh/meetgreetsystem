from dataclasses import dataclass


@dataclass
class TranscriptionResult:
    raw_text: str
    segments: list[dict[str, object]]
    language: str
    pause_count: int
    filler_count: int
    switches: list[dict[str, object]]


def transcribe_audio(audio_path: str) -> TranscriptionResult:
    """
    Placeholder for Whisper-based transcription.

    Notes:
    - Return verbatim text including fillers and pauses.
    - Provide word/segment timestamps.
    - Detect language switches for multilingual responses.
    """
    return TranscriptionResult(
        raw_text="",
        segments=[],
        language="unknown",
        pause_count=0,
        filler_count=0,
        switches=[],
    )
