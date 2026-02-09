import json
import os
from pathlib import Path
from uuid import uuid4


BASE_STORAGE = Path(os.getenv("STORAGE_ROOT", "/storage"))


def ensure_user_storage_path(user_id: str) -> Path:
    path = BASE_STORAGE / user_id
    path.mkdir(parents=True, exist_ok=True)
    return path


def append_metadata(user_id: str, entry: dict) -> Path:
    user_path = ensure_user_storage_path(user_id)
    metadata_path = user_path / "metadata.json"
    if metadata_path.exists():
        metadata = json.loads(metadata_path.read_text())
    else:
        metadata = {"user_id": user_id, "uploads": []}

    metadata["uploads"].append(entry)
    metadata_path.write_text(json.dumps(metadata, indent=2))
    return metadata_path


def generate_upload_id() -> str:
    return uuid4().hex
