from dataclasses import dataclass


@dataclass
class ProcessingResult:
    audio_path: str
    video_path: str


def extract_audio(video_path: str, output_path: str) -> ProcessingResult:
    """
    Placeholder for FFmpeg audio extraction.

    Edge cases:
    - Handle missing audio track.
    - Normalize to a consistent sample rate for Whisper.
    """
    return ProcessingResult(audio_path=output_path, video_path=video_path)
